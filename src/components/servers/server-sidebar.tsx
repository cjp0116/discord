"use client"

import { useServerDetails } from "@/lib/hooks/use-server-details"

import { Button } from "@/components/ui/button"
import { Hash, Volume2, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"
import { SidebarSkeleton } from "@/components/loading/sidebar-skeleton"
import { useSession } from "@/components/providers/session-provider"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ServerSidebarProps {
  serverId: string
}

export function ServerSidebar({ serverId }: ServerSidebarProps) {
  const { data: serverDetails, loading, error, refetch } = useServerDetails(serverId)
  const { profile } = useSession()
  const pathname = usePathname()

  if (loading) {
    return <SidebarSkeleton />
  }

  if (error || !serverDetails) {
    return (
      <div className="w-60 bg-card border-r border-border flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Failed to load server</p>
        <Button variant="ghost" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    )
  }

  const { server, channels, members } = serverDetails

  const currentUserIsMember = members.find(member => member.user_id === profile?.id)
  const canManageChannels = currentUserIsMember?.role === "admin" || currentUserIsMember?.role === "owner"
  const canManageServer = currentUserIsMember?.role === "owner"

  // Group channels by type
  const textChannels = channels.filter(channel => channel.type === 'text')
  const voiceChannels = channels.filter(channel => channel.type === 'voice')

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col">
      {/* Server Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground truncate">{server.name}</h2>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          {canManageServer && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                  <Link href={`/servers/${serverId}/update`}>
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Server Settings</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Text Channels */}
          {textChannels.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Text Channels
                {canManageChannels && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/servers/${serverId}/create-channel`}>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-accent">
                          +
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create Text Channel</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {textChannels.map((channel) => (
                <div className="flex items-center justify-between group" key={channel.id}>
                  <Link
                    href={`/channels/${channel.id}`}
                    className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/50 text-sm ${pathname === `/channels/${channel.id}`
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="truncate">{channel.name}</span>
                  </Link>
                  {canManageChannels && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/channels/${channel.id}/settings`}>
                            <Settings className="w-3 h-3" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Channel</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Voice Channels */}
          {voiceChannels.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Voice Channels
                {canManageChannels && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/servers/${serverId}/create-channel`}>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-accent">
                          +
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create Voice Channel</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {voiceChannels.map((channel) => (
                <div className="flex items-center justify-between group" key={channel.id}>
                  <Link
                    href={`/channels/${channel.id}`}
                    className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-accent/50 text-sm ${pathname === `/channels/${channel.id}`
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="truncate">{channel.name}</span>
                  </Link>
                  {canManageChannels && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/channels/${channel.id}/settings`}>
                            <Settings className="w-3 h-3" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Channel</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
