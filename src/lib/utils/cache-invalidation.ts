import { cache } from "./cache"

// Simple event system for cache invalidation
const cacheInvalidationEvents = new Map<string, Set<() => void>>()

export const subscribeToCacheInvalidation = (key: string, callback: () => void) => {
  if (!cacheInvalidationEvents.has(key)) {
    cacheInvalidationEvents.set(key, new Set())
  }
  cacheInvalidationEvents.get(key)!.add(callback)

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cache invalidation subscription added for key: ${key}`)
  }

  // Return unsubscribe function
  return () => {
    cacheInvalidationEvents.get(key)?.delete(callback)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache invalidation subscription removed for key: ${key}`)
    }
  }
}

export const notifyCacheInvalidation = (key: string) => {
  const callbacks = cacheInvalidationEvents.get(key)
  if (callbacks) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Notifying cache invalidation for key: ${key}, ${callbacks.size} subscribers`)
    }
    callbacks.forEach(callback => callback())
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`No subscribers found for cache invalidation key: ${key}`)
    }
  }
}

// Cache invalidation functions for different data types
export const invalidateServersCache = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Invalidating servers cache')
  }
  cache.invalidatePattern('^servers:')
  notifyCacheInvalidation('servers')
}

export const invalidateMessagesCache = (channelId?: string) => {
  if (channelId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Invalidating messages cache for channel: ${channelId}`)
    }
    // Delete the specific channel cache
    cache.delete(`messages:${channelId}`)
    // Also invalidate any related patterns
    cache.invalidatePattern(`^messages:${channelId}`)
    // Notify subscribers
    notifyCacheInvalidation(`messages:${channelId}`)
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalidating all messages cache')
    }
    cache.invalidatePattern('^messages:')
    notifyCacheInvalidation('messages')
  }
}

export const invalidateServerDetailsCache = (serverId?: string) => {
  if (serverId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Invalidating server details cache for server: ${serverId}`)
    }
    // Delete the specific server cache
    cache.delete(`server-details:${serverId}`)
    // Also invalidate any related patterns
    cache.invalidatePattern(`^server-details:${serverId}`)
    // Notify subscribers
    notifyCacheInvalidation(`server-details:${serverId}`)
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalidating all server details cache')
    }
    cache.invalidatePattern('^server-details:')
    notifyCacheInvalidation('server-details')
  }
}

export const invalidateAllCache = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Invalidating all cache')
  }
  cache.clear()
  // Notify all subscribers
  cacheInvalidationEvents.forEach((_, key) => {
    notifyCacheInvalidation(key)
  })
} 