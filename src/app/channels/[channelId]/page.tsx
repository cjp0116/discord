import { Suspense } from "react"
import { canAccessChannel } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ServerSidebar } from "@/components/servers/server-sidebar"
import { ServerList } from "@/components/servers/server-list"
import { ServerMembersSidebar } from "@/components/servers/server-members-sidebar"
import { MessageContainer } from "@/components/messages/message-container"
import { MessageListSkeleton } from "@/components/loading/message-skeleton"
import { SidebarSkeleton } from "@/components/loading/sidebar-skeleton"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Hash, Search, HelpCircle, Download } from "lucide-react"
import { SessionGuard } from "@/components/auth/session-guard"
import { UserMenu } from "@/components/ui/user-menu"
import { Button } from "@/components/ui/button"

interface ChannelPageProps {
  params: Promise<{ channelId: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = await params

  if (!(await canAccessChannel(channelId))) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  
  // Get channel details
  const { data: channel } = await supabase.from("channels").select("*, servers(name, id)").eq("id", channelId).single()

  if (!channel) {
    redirect("/dashboard")
  }

  return (
    <SessionGuard requireAuth={true}>
      <div className="h-screen bg-background flex">
        {/* Far Left: Server List */}
        <Suspense fallback={<div className="w-16 bg-card border-r border-border" />}>
          <ServerList currentServerId={channel.servers.id} />
        </Suspense>

        {/* Left: Server Sidebar */}
        <Suspense fallback={<SidebarSkeleton />}>
          <ServerSidebar serverId={channel.servers.id} />
        </Suspense>

        {/* Center: Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-12 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-foreground font-semibold">{channel.name}</h1>
              {channel.description && (
                <>
                  <div className="w-px h-4 bg-border mx-2" />
                  <p className="text-muted-foreground text-sm">{channel.description}</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>

          {/* Messages */}
          <Suspense fallback={<MessageListSkeleton />}>
            <MessageContainer channelId={channelId} channelName={channel.name} />
          </Suspense>
        </div>

        {/* Right: Server Members Sidebar */}
        <Suspense fallback={<SidebarSkeleton />}>
          <ServerMembersSidebar serverId={channel.servers.id} />
        </Suspense>
      </div>
    </SessionGuard>
  )
}
