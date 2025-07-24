export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000, backoffFactor = 2 } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors
      if (
        error?.message?.includes("Invalid JWT") ||
        error?.message?.includes("Unauthorized") ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        throw error
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay)

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export function isRateLimitError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.message?.includes("Too Many Requests") ||
    error?.message?.includes("rate limit") ||
    error?.message?.includes("Too Many R")
  )
}
