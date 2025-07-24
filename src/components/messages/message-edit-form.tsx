"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X } from "lucide-react"

interface MessageEditFormProps {
  messageId: string
  initialContent: string
  onCancel: () => void
  onSave: (newContent: string) => void
}

export function MessageEditForm({ messageId, initialContent, onCancel, onSave }: MessageEditFormProps) {
  const [content, setContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content === initialContent) {
      onCancel()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      onSave(content.trim())
    } catch (error) {
      setError("Failed to edit message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-600 border-gray-500 text-white"
          disabled={isLoading}
          autoFocus
          maxLength={2000}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !content.trim() || content === initialContent}
          className="h-8 w-8 p-0"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-gray-400">Press Enter to save • Escape to cancel</p>
    </form>
  )
}
