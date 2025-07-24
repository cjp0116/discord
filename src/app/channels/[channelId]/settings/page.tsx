import { canAccessChannel, canManageServer } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChannelSettingsForm } from "@/components/forms/channel-settings-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/ui/user-menu"
import { SessionGuard } from "@/components/auth/session-guard"

interface ChannelSettingsPageProps {
  params: {
    channelId: string
  }
}

export default async function ChannelSettingsPage({ params }: ChannelSettingsPageProps) {
  const { channelId } = await params;
  const supabase = await createClient();
  const { data: channel, error: channelError } = await supabase
    .from('channels')
    .select(`*, servers(name, id)`)
    .eq('id', channelId)
    .single();

  if (channelError || !channel || !channel.servers) {
    console.error("Error fetching channel for settings:", channelError)
    redirect("/dashboard")
  }

  const _canManageServer = await canManageServer(channel.servers.id);
  const _canAccessChannel = await canAccessChannel(channelId);

  if (!_canAccessChannel || !_canManageServer) {
    redirect(`/channels/${channelId}`)
  }

  const initialData = {
    name: channel.name,
    description: channel.description,
    type: channel.type as "text" | "voice",
  }

  return (
    <SessionGuard requireAuth={true}>
      <div className="min-h-screen bg-background flex">
        {/* Left Sidebar */}
        <div className="w-60 bg-card border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">
                # GENERAL TEXT CHANNELS
              </h2>
            </div>
            <div className="mt-2">
              <h3 className="text-xs text-muted-foreground">TEXT CHANNELS</h3>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-2">
            <nav className="space-y-1">
              <Link
                href={`/channels/${channelId}/settings`}
                className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-accent rounded-md"
              >
                Overview
              </Link>
              <Link
                href={`/channels/${channelId}/settings/permissions`}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md"
              >
                Permissions
              </Link>
              <Link
                href={`/channels/${channelId}/settings/invites`}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md"
              >
                Invites
              </Link>
              <Link
                href={`/channels/${channelId}/settings/integrations`}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md"
              >
                Integrations
              </Link>
            </nav>

            {/* Delete Channel */}
            <div className="mt-8">
              <Link
                href={`/channels/${channelId}/settings/delete`}
                className="flex items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Channel
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild size="sm">
                <Link href={`/channels/${channelId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Channel
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Overview</h1>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/channels/${channelId}`}>
                    <X className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <ChannelSettingsForm
                channelId={channelId}
                initialData={initialData}
                serverName={channel.servers.name}
              />
            </div>
          </div>
        </div>
      </div>
    </SessionGuard>
  )
}