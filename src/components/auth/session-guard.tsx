"use client"

import type React from "react"

import { useSession } from "@/components/providers/session-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/loading/page-loader"

interface SessionGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function SessionGuard({ children, requireAuth = true, redirectTo = "/login" }: SessionGuardProps) {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // Only redirect if not already on dashboard
        const currentPath = window.location.pathname
        if (currentPath !== '/dashboard') {
          router.push("/dashboard")
        }
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  if (loading) {
    return <PageLoader message="Checking authentication..." />
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  if (!requireAuth && user) {
    return null // Will redirect
  }

  return <>{children}</>
}
