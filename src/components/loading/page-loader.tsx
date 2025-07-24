"use client"

import { Spinner } from "@/components/ui/spinner"
import { FadeIn } from "@/components/ui/fade-in"

interface PageLoaderProps {
  message?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function PageLoader({ message = "Loading...", size = "xl" }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center">
      <FadeIn className="flex flex-col items-center gap-6">
        <div className="relative">
          <Spinner size={size} className="text-primary" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{message}</h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
