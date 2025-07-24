"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWebSocketMessages } from "@/lib/hooks/use-websocket-messages"

interface Reaction {
  id: string
  emoji: string
  count: number
  users: Array<{
    id: string
    username: string
    display_name: string | null
  }>
  hasReacted: boolean
}

interface MessageReactionsProps {
  messageId: string
  channelId: string
  reactions: Reaction[]
}

export function MessageReactions({ messageId, channelId, reactions }: MessageReactionsProps) {
  const { addReaction } = useWebSocketMessages(channelId)

  if (!reactions || reactions.length === 0) {
    return null
  }

  const handleReactionClick = async (emoji: string) => {
    try {
      const result = await addReaction(messageId, emoji)
      if (!result.success) {
        console.error("Failed to toggle reaction:", result.errors)
      }
    } catch (error) {
      console.error("Failed to toggle reaction:", error)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 mt-1">
        {reactions.map((reaction) => {
          const userNames = reaction.users
            .map((user) => user.display_name || user.username)
            .slice(0, 5)
            .join(", ")
          const remainingCount = Math.max(0, reaction.count - 5)
          const tooltipText = remainingCount > 0 ? `${userNames} and ${remainingCount} more` : userNames

          return (
            <Tooltip key={reaction.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={reaction.hasReacted ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-6 px-2 text-xs transition-all duration-200 hover:scale-105 ${reaction.hasReacted
                    ? "bg-primary/20 border border-primary/50 hover:bg-primary/30"
                    : "hover:bg-accent"
                    }`}
                  onClick={() => handleReactionClick(reaction.emoji)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
