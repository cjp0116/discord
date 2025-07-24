"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MoreHorizontal, Smile, Edit, Trash2, Reply } from "lucide-react"
import { useSession } from "@/components/providers/session-provider"
import { useWebSocketMessages } from "@/lib/hooks/use-websocket-messages"

interface MessageOptionsProps {
  messageId: string
  messageUserId: string
  channelId: string
  onEdit: () => void
  className?: string
}

const COMMON_EMOJIS = ["👍", "👎", "❤️", "😂", "😮", "😢", "😡", "👏"]

export function MessageOptions({ messageId, messageUserId, channelId, onEdit, className }: MessageOptionsProps) {
  const { profile } = useSession()
  const { addReaction, deleteMessage } = useWebSocketMessages(channelId)
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwnMessage = profile?.id === messageUserId

  const handleReaction = async (emoji: string) => {
    try {
      const result = await addReaction(messageId, emoji)
      if (result.success) {
        setIsReactionOpen(false)
      } else {
        console.error("Failed to add reaction:", result.errors)
      }
    } catch (error) {
      console.error("Failed to add reaction:", error)
    }
  }

  const handleDelete = async () => {
    if (!isOwnMessage) return

    try {
      setIsDeleting(true)
      const result = await deleteMessage(messageId)
      if (result.success) {
        setIsOptionsOpen(false)
      } else {
        console.error("Failed to delete message:", result.error)
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    onEdit()
    setIsOptionsOpen(false)
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Quick Reaction Button */}
        <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-600 transition-all duration-200 hover:scale-110"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Add Reaction</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64 p-3" align="center">
            <div className="grid grid-cols-4 gap-2">
              {COMMON_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-lg hover:bg-accent transition-all duration-200 hover:scale-110"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* More Options Button */}
        <Popover open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-600 transition-all duration-200 hover:scale-110"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>More Options</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-48 p-1" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2 hover:bg-accent"
                onClick={() => handleReaction("👍")}
              >
                <Smile className="w-4 h-4 mr-2" />
                Add Reaction
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 px-2 hover:bg-accent"
                disabled // Placeholder for future reply functionality
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>

              {isOwnMessage && (
                <>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 hover:bg-accent"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Message
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Message"}
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}
