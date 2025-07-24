import type React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse"
}

export function Spinner({ className, size = "md", variant = "default", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)} {...props}>
        <div
          className={cn("rounded-full bg-primary animate-bounce", size === "sm" ? "h-2 w-2" : "h-3 w-3")}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn("rounded-full bg-primary animate-bounce", size === "sm" ? "h-2 w-2" : "h-3 w-3")}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn("rounded-full bg-primary animate-bounce", size === "sm" ? "h-2 w-2" : "h-3 w-3")}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    )
  }

  if (variant === "pulse") {
    return <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size], className)} {...props} />
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
