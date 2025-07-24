"use client"

import { useWebSocketMessages } from "@/lib/hooks/use-websocket-messages"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { MessageListSkeleton } from "@/components/loading/message-skeleton"
import { MessageItem } from "@/components/messages/message-item"

interface MessageListProps {
  channelId: string
}

export function MessageList({ channelId }: MessageListProps) {
  const {
    data: messages,
    loading,
    error,
    isConnected,
    isAuthenticated,
    refetch
  } = useWebSocketMessages(channelId)

  if (loading) {
    return <MessageListSkeleton />
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <p className="mb-4">Failed to load messages: {error}</p>
        <Button onClick={refetch} variant="outline" className="hover:bg-accent/50">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2">No messages yet. Start the conversation!</p>
          <div className="flex items-center justify-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Connection status indicator */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-2 border-b border-border/50">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {isConnected && isAuthenticated ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span>Real-time chat active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-yellow-500" />
              <span>Connecting to real-time chat...</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}
