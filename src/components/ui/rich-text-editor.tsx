"use client"

import * as React from "react"
import { Bold, Italic, Strikethrough, Eye, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Let everyone know how to use this channel!",
  maxLength = 1024,
  className
}: RichTextEditorProps) {
  const [isBold, setIsBold] = React.useState(false)
  const [isItalic, setIsItalic] = React.useState(false)
  const [isStrikethrough, setIsStrikethrough] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const remainingChars = maxLength - value.length

  const applyFormatting = (format: 'bold' | 'italic' | 'strikethrough') => {
    const start = 0
    const end = value.length

    let formattedText = value
    let isActive = false

    switch (format) {
      case 'bold':
        isActive = isBold
        formattedText = isActive
          ? value.replace(/\*\*(.*?)\*\*/g, '$1')
          : `**${value}**`
        setIsBold(!isActive)
        break
      case 'italic':
        isActive = isItalic
        formattedText = isActive
          ? value.replace(/\*(.*?)\*/g, '$1')
          : `*${value}*`
        setIsItalic(!isActive)
        break
      case 'strikethrough':
        isActive = isStrikethrough
        formattedText = isActive
          ? value.replace(/~~(.*?)~~/g, '$1')
          : `~~${value}~~`
        setIsStrikethrough(!isActive)
        break
    }

    onChange(formattedText)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-t-md border-b">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('bold')}
          className={cn(
            "h-8 w-8 p-0",
            isBold && "bg-accent text-accent-foreground"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('italic')}
          className={cn(
            "h-8 w-8 p-0",
            isItalic && "bg-accent text-accent-foreground"
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('strikethrough')}
          className={cn(
            "h-8 w-8 p-0",
            isStrikethrough && "bg-accent text-accent-foreground"
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            "h-8 w-8 p-0",
            showPreview && "bg-accent text-accent-foreground"
          )}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] resize-none border-t-0 rounded-t-none focus:ring-2 focus:ring-ring"
          maxLength={maxLength}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {remainingChars}
        </div>
      </div>

      {/* Preview */}
      {showPreview && value && (
        <div className="p-3 bg-muted/30 rounded-md border">
          <div className="text-sm font-medium mb-2">Preview:</div>
          <div className="text-sm whitespace-pre-wrap">
            {value
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/~~(.*?)~~/g, '<del>$1</del>')
              .split('\n').map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
} 