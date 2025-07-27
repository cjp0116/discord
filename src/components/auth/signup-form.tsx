"use client"

import { useActionState, useEffect } from "react"
import { signUp } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormError } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

export function SignUpForm() {
  const [state, action, isPending] = useActionState(signUp, null)
  const router = useRouter()

  useEffect(() => {
    if (state) {
      console.log('signup form state:', state)
      if (state.success && state.redirectTo) {
        // Add a small delay to ensure session state is updated
        setTimeout(() => {
          router.push(state.redirectTo)
        }, 500)
      }
    }
  }, [state, router])
  return (
    <Card className="w-full max-w-md shadow-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">Join the conversation!</CardDescription>
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

          <FormField error={state?.errors?.username?.[0]}>
            <Label htmlFor="username" className="text-foreground">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              disabled={isPending}
              autoComplete="username"
              className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          <FormField error={state?.errors?.displayName?.[0]}>
            <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Enter your display name"
              required
              disabled={isPending}
              autoComplete="name"
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
              autoComplete="new-password"
              className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          <Button type="submit" className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-300" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating account...
              </>
            ) : (
              "Continue"
            )}
          </Button>

          {state?.errors && !state.success && <FormError message="Please check the errors above and try again." />}
        </form>
      </CardContent>
    </Card>
  )
}
