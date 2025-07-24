"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"

  interface InviteUsersModalProps {
  isOpen: boolean
  onClose: () => void
  serverName: string
  inviteCode?: string
}

export function InviteUsersModal({ isOpen, onClose, serverName, inviteCode }: InviteUsersModalProps) {
  const [copied, setCopied] = useState(false)
  const inviteLink = inviteCode ? `${window.location.origin}/invite/${inviteCode}` : ""

  const handleCopy = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people to {serverName}</DialogTitle>
          <DialogDescription>
            Share this link with others to grant access to your server
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-link">Server invite link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This link expires in 7 days
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}