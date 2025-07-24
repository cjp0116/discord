"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useWebSocketMessages } from "@/lib/hooks/use-websocket-messages"

interface MessageInputProps {
  channelId: string
  channelName: string
  onMessageSent?: () => void
}

export function MessageInput({ channelId, channelName, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isConnected, isAuthenticated } = useWebSocketMessages(channelId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    setIsSending(true)
    try {
      const result = await sendMessage(content.trim())
      if (result.success) {
        setContent("")
        onMessageSent?.()
      } else {
        console.error("Failed to send message:", result.errors)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  return (
    <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            className="min-h-[38px] max-h-32 resize-none pr-12"
            disabled={isSending || !isAuthenticated}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending || !isAuthenticated}
          className="shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form> 
      
      {/* Connection status */}
      {(!isConnected || !isAuthenticated) && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {!isConnected ? "Connecting to real-time chat..." : "Authenticating..."}
        </div>
      )}
    </div>
  )
}


