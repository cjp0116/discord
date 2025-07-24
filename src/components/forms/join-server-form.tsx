"use client"

import { useActionState } from "react"
import { joinServer } from "@/lib/actions/servers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormError } from "@/components/ui/form"
import { FadeIn } from "@/components/ui/fade-in"

export function JoinServerForm() {
  const [state, action, isPending] = useActionState(joinServer, null)

  return (
    <FadeIn className="w-full max-w-md">
      <Card className="animate-in slide-in-from-bottom-4 duration-500 shadow-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Join a Server</CardTitle>
          <CardDescription className="text-muted-foreground">Enter an invite code to join an existing server.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <FadeIn delay={100}>
              <FormField error={state?.errors?.inviteCode?.[0]}>
                <Label htmlFor="inviteCode" className="text-foreground">Invite Code</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  placeholder="Enter invite code"
                  required
                  disabled={isPending}
                  className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
                />
              </FormField>
            </FadeIn>

            <FadeIn delay={200}>
              <Button type="submit" className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-300" loading={isPending} loadingText="Joining server...">
                Join Server
              </Button>
            </FadeIn>

            {state?.errors && !state.success && (
              <FadeIn delay={300}>
                <FormError message="Please check the invite code and try again." />
              </FadeIn>
            )}
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
