"use client"

import { MessageList } from "@/components/messages/message-list"
import { MessageInput } from "@/components/messages/message-input"
import { useMessages } from "@/lib/hooks/use-messages"

interface MessageContainerProps {
  channelId: string
  channelName: string
}

export function MessageContainer({ channelId, channelName }: MessageContainerProps) {
  const { refetch } = useMessages(channelId)

  const handleMessageSent = () => {
    // Trigger a refetch of messages
    refetch()
  }

  return (
    <>
      <MessageList channelId={channelId} />
      <MessageInput
        channelId={channelId}
        channelName={channelName}
        onMessageSent={handleMessageSent}
      />
    </>
  )
} 