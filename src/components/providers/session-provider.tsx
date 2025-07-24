"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { withRetry, isRateLimitError } from "@/lib/utils/retry"
import { throttle } from "@/lib/utils/debounce"
import { debounce } from "@/lib/utils/debounce"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  status: string
  created_at: string
  updated_at: string
}

interface SessionContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Debug: Log when SessionProvider mounts
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SessionProvider mounted')
    }
  }, [])


  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('fetchProfile called with userId:', userId)
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('fetchProfile success:', data)
      }

      return data as UserProfile
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }, [supabase])

  // Throttled session refresh to prevent rapid API calls
  const refreshSession = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('refreshSession called', {
        timestamp: new Date().toISOString(),
        stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
      })
    }

    const now = Date.now()
    // Don't refresh if we just refreshed within the last 30 seconds
    if (now - lastRefresh < 30 * 1000) {
      if (process.env.NODE_ENV === 'development') {
        console.log('refreshSession: skipping due to throttling')
      }
      return
    }

    try {
      setError(null)

      const sessionData = await withRetry(
        async () => {
          const { data, error } = await supabase.auth.refreshSession()
          if (error) {
            throw error
          }
          return data
        },
        {
          maxAttempts: 2,
          baseDelay: 2000,
          maxDelay: 5000,
        },
      )

      const newUser = sessionData.session?.user ?? null
      setUser(newUser)
      setLastRefresh(now)

      // Fetch profile if user exists
      if (newUser) {
        const userProfile = await fetchProfile(newUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
        router.push("/login")
      }
    } catch (error: any) {
      console.error("Session refresh error:", error)

      if (isRateLimitError(error)) {
        setError("Too many requests. Please wait a moment.")
      } else if (error?.message?.includes("refresh_token_not_found")) {
        setError("Session expired. Please log in again.")
        setUser(null)
        setProfile(null)
        router.push("/login")
      } else {
        setError("Failed to refresh session.")
      }
    }
  }, [supabase, router, lastRefresh, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push("/login")
    } catch (error: any) {
      console.error("Sign out error:", error)
      setError("Failed to sign out.")
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    let mounted = true
    let refreshInterval: NodeJS.Timeout

    // Get initial session
    const getInitialSession = async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('getInitialSession called')
      }

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Get session error:", error)
          if (mounted) {
            setError("Failed to get session.")
          }
        } else if (mounted) {
          const newUser = session?.user ?? null
          if (process.env.NODE_ENV === 'development') {
            console.log('getInitialSession - session user:', newUser?.id)
          }

          setUser(newUser)
          setLastRefresh(Date.now())

          // Fetch profile if user exists
          if (newUser) {
            const userProfile = await fetchProfile(newUser.id)
            if (mounted) {
              if (process.env.NODE_ENV === 'development') {
                console.log('getInitialSession - setting profile:', userProfile)
              }
              setProfile(userProfile)
            }
          }
        }
      } catch (error: any) {
        console.error("Get session error:", error)
        if (mounted) {
          setError("Failed to initialize session.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state change:', event, 'session user:', session?.user?.id)
      }

      if (mounted) {
        const newUser = session?.user ?? null
        setUser(newUser)
        setLoading(false)
        setError(null)
        setLastRefresh(Date.now())

        // Fetch profile if user exists
        if (newUser) {
          const userProfile = await fetchProfile(newUser.id)
          if (mounted) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Auth state change - setting profile:', userProfile)
            }
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }

        // Handle different auth events
        switch (event) {
          case "SIGNED_IN":
            // Don't refresh router - let the auth state change handle navigation
            break
          case "SIGNED_OUT":
            router.push("/login")
            break
          case "TOKEN_REFRESHED":
            // Don't refresh router - just update the session
            break
          case "USER_UPDATED":
            // Don't refresh router - just update the user
            break
        }
      }
    })

    // Set up automatic token refresh (every 45 minutes, reduced from 50)
    refreshInterval = setInterval(
      () => {
        if (mounted) {
          refreshSession()
        }
      },
      45 * 60 * 1000,
    )
    return () => {
      mounted = false
      subscription.unsubscribe()
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [router, supabase, fetchProfile]) // Removed user, refreshSession from dependencies

  // Throttled visibility change handler
  const handleVisibilityChange = useMemo(
    () =>
      throttle(() => {
        if (document.visibilityState === "visible") {
          refreshSession()
        }
      }, 60000), // Max once per minute
    [refreshSession],
  )

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [handleVisibilityChange])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      refreshSession,
      signOut,
    }),
    [user, profile, loading, error, refreshSession, signOut],
  )

  // Debug: Log context value changes in development
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('Session context value changed', {
  //       userId: user?.id,
  //       profileId: profile?.id,
  //       loading,
  //       hasError: !!error,
  //       timestamp: new Date().toISOString(),
  //       stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
  //     })
  //   }
  // }, [user?.id, profile?.id, loading, error])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
