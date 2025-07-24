"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageOptions } from "@/components/messages/message-options"
import { MessageReactions } from "@/components/messages/message-reaction"
import { MessageEditForm } from "@/components/messages/message-edit-form"
import { useWebSocketMessages } from "@/lib/hooks/use-websocket-messages"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface MessageItemProps {
  message: {
    id: string
    content: string
    created_at: string
    edited_at: string | null
    user_id: string
    channel_id: string
    users: {
      username: string
      display_name: string | null
      avatar_url: string | null
    }
    reactions?: Array<{
      id: string
      emoji: string
      count: number
      users: Array<{
        id: string
        username: string
        display_name: string | null
      }>
      hasReacted: boolean
    }>
  }
}

export function MessageItem({ message }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { editMessage, deleteMessage, addReaction } = useWebSocketMessages(message.channel_id)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (newContent: string) => {
    try {
      const result = await editMessage(message.id, newContent)
      if (result.success) {
        setIsEditing(false)
      } else {
        console.error("Failed to edit message:", result.errors)
      }
    } catch (error) {
      console.error("Error editing message:", error)
    }
  }

  if (isEditing) {
    return (
      <MessageEditForm
        messageId={message.id}
        initialContent={message.content}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    )
  }

  return (
    <div className="group relative p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.users.avatar_url || undefined} />
          <AvatarFallback>
            {message.users.display_name?.[0] || message.users.username[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {message.users.display_name || message.users.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.edited_at && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          <div className="text-sm text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              messageId={message.id}
              channelId={message.channel_id}
              reactions={message.reactions}
            />
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageOptions
            messageId={message.id}
            messageUserId={message.user_id}
            channelId={message.channel_id}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  )
}