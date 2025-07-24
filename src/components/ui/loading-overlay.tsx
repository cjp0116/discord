"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  spinnerSize?: "sm" | "md" | "lg" | "xl"
  message?: string
  blur?: boolean
}

export function LoadingOverlay({
  isLoading,
  children,
  className,
  spinnerSize = "lg",
  message,
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isLoading && blur ? "blur-sm opacity-50" : "blur-none opacity-100",
        )}
      >
        {children}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300">
          <Spinner size={spinnerSize} className="text-primary" />
          {message && <p className="mt-4 text-sm text-muted-foreground animate-pulse">{message}</p>}
        </div>
      )}
    </div>
  )
}
