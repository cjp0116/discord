"use client"

import { useActionState } from "react"
import { createChannel } from "@/lib/actions/channels";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormError } from "@/components/ui/form"
import { FadeIn } from "@/components/ui/fade-in"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // Assuming you have or will add this component

interface CreateChannelFormProps {
  serverId: string
  serverName: string
}

export function CreateChannelForm({ serverId, serverName }: CreateChannelFormProps) {
  const [state, action, isPending] = useActionState(createChannel.bind(null, serverId), null)

  return (
    <FadeIn className="w-full max-w-md">
      <Card className="animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <CardTitle>Create Channel</CardTitle>
          <CardDescription>Create a new channel for {serverName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <FadeIn delay={100}>
              <FormField error={state?.errors?.name?.[0]}>
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., general, voice-chat"
                  required
                  disabled={isPending}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </FormField>
            </FadeIn>

            <FadeIn delay={200}>
              <FormField error={state?.errors?.description?.[0]}>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="e.g., Discuss anything here"
                  disabled={isPending}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </FormField>
            </FadeIn>

            <FadeIn delay={300}>
              <FormField error={state?.errors?.type?.[0]}>
                <Label>Channel Type</Label>
                <RadioGroup defaultValue="text" name="type" className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="type-text" disabled={isPending} />
                    <Label htmlFor="type-text">Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="voice" id="type-voice" disabled={isPending} />
                    <Label htmlFor="type-voice">Voice</Label>
                  </div>
                </RadioGroup>
              </FormField>
            </FadeIn>

            <FadeIn delay={400}>
              <Button type="submit" className="w-full" loading={isPending} loadingText="Creating channel...">
                Create Channel
              </Button>
            </FadeIn>

            {state?.errors && !state.success && (
              <FadeIn delay={500}>
                <FormError message="Please check the errors above and try again." />
              </FadeIn>
            )}
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
