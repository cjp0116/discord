import { Suspense } from "react"
import { canAccessServer } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ServerSidebar } from "@/components/servers/server-sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "@/components/ui/user-menu"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SidebarSkeleton } from "@/components/loading/sidebar-skeleton"
import { SessionGuard } from "@/components/auth/session-guard"
interface ServerPageProps {
  params: { serverId: string }
}

export default async function ServerPage({ params }: ServerPageProps) {
  const { serverId } = await params;

  if (!(await canAccessServer(serverId))) redirect('/dashboard');

  const supabase = await createClient();
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('id, name, type')
    .eq('server_id', serverId)
    .order('position', { ascending: true })

  if (channelsError) {
    console.error('Error fetching channels:', channelsError);
    redirect('/dashboard')
  }

  if (channels && channels.length > 0) {
    redirect(`/channels/${channels[0].id}`)
  }

  return (
    <SessionGuard requireAuth={true}>
      <div className="h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10 flex">
        
        <Suspense fallback={<SidebarSkeleton />}>
          <ServerSidebar serverId={serverId} />
        </Suspense>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">No Channels Yet!</h1>
            <p className="text-muted-foreground">It looks like this server doesn't have any channels.</p>
            <Button asChild className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-300">
              <Link href={`/servers/${serverId}/create-channel`}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Channel
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </SessionGuard>

  );
}