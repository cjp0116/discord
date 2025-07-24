'use client'

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application Error', error)
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <CardTitle className="text-foreground">Something went wrong!</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">An unexpected error occurred</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <Button onClick={reset} className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}