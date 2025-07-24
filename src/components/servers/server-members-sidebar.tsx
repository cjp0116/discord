"use client"

import { useServerDetails } from "@/lib/hooks/use-server-details"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, Search } from "lucide-react"
import { SidebarSkeleton } from "@/components/loading/sidebar-skeleton"

interface ServerMembersSidebarProps {
  serverId: string
}

export function ServerMembersSidebar({ serverId }: ServerMembersSidebarProps) {
  const { data: serverDetails, loading, error } = useServerDetails(serverId)

  if (loading) {
    return <SidebarSkeleton />
  }

  if (error || !serverDetails) {
    return (
      <div className="w-60 bg-card border-l border-border flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Failed to load members</p>
      </div>
    )
  }

  const { members } = serverDetails

  // Group members by status
  const onlineMembers = members.filter(member => member.users?.status === 'online')
  const idleMembers = members.filter(member => member.users?.status === 'away')
  const busyMembers = members.filter(member => member.users?.status === 'busy')
  const offlineMembers = members.filter(member => member.users?.status === 'offline')

  const renderMember = (member: typeof members[0]) => (
    <div key={member.id} className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-accent/50 group">
      <div className="relative">
        <Avatar className="w-8 h-8">
          <AvatarImage src={member.users?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {member.users?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${member.users?.status === "online"
            ? "bg-green-500"
            : member.users?.status === "away"
              ? "bg-yellow-500"
              : member.users?.status === "busy"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {member.users?.display_name || member.users?.username}
        </div>
        {member.role !== "member" && (
          <div className="text-xs text-muted-foreground capitalize">
            {member.role}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-60 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Members — {members.length}
          </h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-muted/50 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        {/* Online Members */}
        {onlineMembers.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Online — {onlineMembers.length}
            </div>
            {onlineMembers.map(renderMember)}
          </div>
        )}

        {/* Idle Members */}
        {idleMembers.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Idle — {idleMembers.length}
            </div>
            {idleMembers.map(renderMember)}
          </div>
        )}

        {/* Busy Members */}
        {busyMembers.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Busy — {busyMembers.length}
            </div>
            {busyMembers.map(renderMember)}
          </div>
        )}

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Offline — {offlineMembers.length}
            </div>
            {offlineMembers.map(renderMember)}
          </div>
        )}
      </div>
    </div>
  )
} 