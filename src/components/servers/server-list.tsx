"use client"

import { useSession } from "@/components/providers/session-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Home, Mic, Headphones } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Server {
  id: string
  name: string
  icon_url?: string
  invite_code: string
}

interface ServerListProps {
  currentServerId?: string
}

export function ServerList({ currentServerId }: ServerListProps) {
  const { profile } = useSession()

  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserServers() {
      if (!profile?.id) return

      const supabase = createClient()
      const { data: serverMembers, error } = await supabase
        .from('server_members')
        .select(`
          server_id,
          servers (
            id,
            name,
            icon_url,
            invite_code
          )
        `)
        .eq('user_id', profile.id)

      if (!error && serverMembers) {
        const userServers = serverMembers.map(member => member.servers).filter(Boolean) as Server[]
        setServers(userServers)
      }
      setLoading(false)
    }

    fetchUserServers()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-3 space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-12 h-12 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-3 space-y-2">
        {/* Home Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 p-0 rounded-full hover:bg-accent"
              asChild
            >
              <Link href="/dashboard">
                <Home className="w-6 h-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="w-8 h-px bg-border" />

        {/* Server List */}
        {servers.map((server) => (
          <Tooltip key={server.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-full hover:bg-accent transition-all duration-200 ${currentServerId === server.id ? 'bg-accent' : ''
                    }`}
                  asChild
                >
                  <Link href={`/servers/${server.id}`}>
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={server.icon_url || undefined} />
                      <AvatarFallback className="text-sm font-semibold">
                        {server.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>

                {/* Active indicator */}
                {currentServerId === server.id && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-foreground rounded-r-full" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              <p>{server.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Add Server Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 p-0 rounded-full hover:bg-accent"
              asChild
            >
              <Link href="/servers/create">
                <Plus className="w-6 h-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="flex-1" />
        <div className="w-8 h-px bg-border" />

        {/* User Controls */}
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 rounded-full hover:bg-accent"
              >
                <Mic className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              <p>Voice Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 rounded-full hover:bg-accent"
              >
                <Headphones className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              <p>User Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-sm font-semibold">
                    {profile?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.4 w-3 h-3 rounded-full border-2 border-card bg-green-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              <div className="text-center">
                <p className="font-medium">{profile?.username}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
} 