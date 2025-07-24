"use client"

import { useActionState } from "react"
import { createServer } from "@/lib/actions/servers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormError } from "@/components/ui/form"
import { FadeIn } from "@/components/ui/fade-in"

export function CreateServerForm() {
  const [state, action, isPending] = useActionState(createServer, null)

  return (
    <FadeIn className="w-full max-w-md">
      <Card className="animate-in slide-in-from-bottom-4 duration-500 shadow-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Create a Server</CardTitle>
          <CardDescription className="text-muted-foreground">Your server is where you and your friends hang out.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <FadeIn delay={100}>
              <FormField error={state?.errors?.name?.[0]}>
                <Label htmlFor="name" className="text-foreground">Server Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter server name"
                  required
                  disabled={isPending}
                  className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
                />
              </FormField>
            </FadeIn>

            <FadeIn delay={200}>
              <FormField error={state?.errors?.description?.[0]}>
                <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Enter server description"
                  disabled={isPending}
                  className="transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
                />
              </FormField>
            </FadeIn>

            <FadeIn delay={300}>
              <Button type="submit" className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-300" loading={isPending} loadingText="Creating server...">
                Create Server
              </Button>
            </FadeIn>

            {state?.errors && !state.success && (
              <FadeIn delay={400}>
                <FormError message="Please check the errors above and try again." />
              </FadeIn>
            )}
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
