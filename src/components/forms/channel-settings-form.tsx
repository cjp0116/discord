"use client"

import * as React from "react"
import { useActionState } from "react"
import { updateChannel } from "@/lib/actions/channels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormError } from "@/components/ui/form"
import { FadeIn } from "@/components/ui/fade-in"
import { deleteChannel } from "@/lib/actions/channels"

interface ChannelSettingsFormProps {
  channelId: string
  initialData: {
    name: string
    description: string | null
    type: "text" | "voice"
  }
  serverName: string
}

export function ChannelSettingsForm({ channelId, initialData }: ChannelSettingsFormProps) {
  const [state, action, isPending] = useActionState(updateChannel.bind(null, channelId), null)
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteChannel.bind(null, channelId), null)
  const [channelName, setChannelName] = React.useState(initialData.name)
  const [channelTopic, setChannelTopic] = React.useState(initialData.description || "")
  const [slowmode, setSlowmode] = React.useState("off")
  const [ageRestricted, setAgeRestricted] = React.useState(false)
  const [hideAfterInactivity, setHideAfterInactivity] = React.useState("3")

  return (
    <div className="space-y-8">
      {/* Channel Name Section */}
      <FadeIn delay={100}>
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium">
            Channel Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="general"
            disabled={isPending}
            className="max-w-md"
          />
        </div>
      </FadeIn>

      {/* Channel Topic Section */}
      <FadeIn delay={200}>
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Channel Topic
          </Label>
          <RichTextEditor
            value={channelTopic}
            onChange={setChannelTopic}
            placeholder="Let everyone know how to use this channel!"
            maxLength={1024}
          />
        </div>
      </FadeIn>

      {/* Slowmode Section */}
      <FadeIn delay={300}>
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Slowmode
          </Label>
          <Select value={slowmode} onValueChange={setSlowmode}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="600">10 minutes</SelectItem>
              <SelectItem value="900">15 minutes</SelectItem>
              <SelectItem value="1800">30 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="7200">2 hours</SelectItem>
              <SelectItem value="21600">6 hours</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Members will be restricted to sending one message and creating one thread per this interval, unless they have Manage Channel or Manage Messages permissions.
          </p>
        </div>
      </FadeIn>

      {/* Age-Restricted Channel Section */}
      <FadeIn delay={400}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Age-Restricted Channel
            </Label>
            <Switch
              checked={ageRestricted}
              onCheckedChange={setAgeRestricted}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Users will need to confirm they are of over legal age to view in the content in this channel. Age-restricted channels are exempt from the explicit content filter.
          </p>
        </div>
      </FadeIn>

      {/* Hide After Inactivity Section */}
      <FadeIn delay={500}>
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Hide After Inactivity
          </Label>
          <Select value={hideAfterInactivity} onValueChange={setHideAfterInactivity}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">1 Week</SelectItem>
              <SelectItem value="14">2 Weeks</SelectItem>
              <SelectItem value="30">1 Month</SelectItem>
              <SelectItem value="90">3 Months</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            New threads will not show in the channel list after being inactive for the specified duration.
          </p>
        </div>
      </FadeIn>

      {/* Save Button */}
      <FadeIn delay={600}>
        <div className="pt-4">
          <form action={action} className="space-y-4">
            <input type="hidden" name="name" value={channelName} />
            <input type="hidden" name="description" value={channelTopic} />
            <input type="hidden" name="type" value={initialData.type} />

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? "Saving changes..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </FadeIn>

      {/* Delete Channel Button */}
      <FadeIn delay={700}>
        <form action={deleteAction} className="space-y-4">
          <Button
            variant='outline'
            size='sm'
            type="submit"
            className="flex items-center px-3 py-2 text-sm font-medium border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 rounded-md"
            disabled={isDeleting}
            loading={isDeleting}
            loadingText="Deleting channel..."
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>

            Delete Channel
          </Button>
        </form>
      </FadeIn >
      {/* Error Display */}
      {
        state?.errors && !state.success && (
          <FadeIn delay={700}>
            <FormError message="Please check the errors above and try again." />
          </FadeIn>
        )
      }
    </div>
  )
}

