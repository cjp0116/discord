"use client"
import { useActionState, useEffect } from "react"
import { signIn } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormError } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const [state, action, isPending] = useActionState(signIn, null)
  useEffect(() => {
    if (state) {
      console.log('login form state:', state)
    }
  }, [state])
  return (
    <Card className="w-full max-w-md shadow-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Welcome back!</CardTitle>
        <CardDescription className="text-muted-foreground">We're so excited to see you again!</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <FormField error={state?.errors?.email?.[0]}>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={isPending}
              autoComplete="email"
              className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          <FormField error={state?.errors?.password?.[0]}>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isPending}
              autoComplete="current-password"
              className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          <Button type="submit" className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-300" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              "Log In"
            )}
          </Button>

          {state?.errors && !state.success && <FormError message="Please check your credentials and try again." />}
        </form>
      </CardContent>
    </Card>
  )
}
