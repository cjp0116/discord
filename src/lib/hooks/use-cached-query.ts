"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { cache } from "@/lib/utils/cache"
import { withRetry } from "@/lib/utils/retry"

interface UseCachedQueryOptions<T> {
  key: string
  queryFn: () => Promise<T>
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
}

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  isStale: boolean
}

export function useCachedQuery<T>({
  key,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = false,
  refetchInterval,
}: UseCachedQueryOptions<T>) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: false,
    error: null,
    isStale: false,
  })

  // Use refs to store stable references
  const queryFnRef = useRef(queryFn)
  const enabledRef = useRef(enabled)
  const keyRef = useRef(key)
  const fetchingRef = useRef(false)

  // Update refs when props change
  queryFnRef.current = queryFn
  enabledRef.current = enabled
  keyRef.current = key

  const fetchData = useCallback(
    async (force = false) => {
      if (!enabledRef.current || fetchingRef.current) return

      const currentKey = keyRef.current

      // Check cache first
      const cachedData = cache.get<T>(currentKey)
      if (cachedData && !force) {
        setState((prev) => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          isStale: false,
        }))
        return cachedData
      }

      fetchingRef.current = true
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await withRetry(queryFnRef.current, {
          maxAttempts: 2,
          baseDelay: 1000,
          maxDelay: 3000,
        })

        // Cache the result
        cache.set(currentKey, data, cacheTime)

        setState({
          data,
          loading: false,
          error: null,
          isStale: false,
        })

        return data
      } catch (error: any) {
        console.error(`Query error for key ${currentKey}:`, error)

        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "An error occurred",
        }))

        throw error
      } finally {
        fetchingRef.current = false
      }
    },
    [], // Empty dependency array to make it stable
  )

  const refetch = useCallback(() => fetchData(true), [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(keyRef.current)
    setState((prev) => ({ ...prev, isStale: true }))
  }, [])

  // Initial fetch - only run when key or enabled changes
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [key, enabled, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (document.visibilityState === "visible" && enabledRef.current) {
        fetchData()
      }
    }

    document.addEventListener("visibilitychange", handleFocus)
    return () => document.removeEventListener("visibilitychange", handleFocus)
  }, [refetchOnWindowFocus, fetchData])

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(() => {
      if (enabledRef.current) {
        fetchData()
      }
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, fetchData])

  return {
    ...state,
    refetch,
    invalidate,
  }
}
