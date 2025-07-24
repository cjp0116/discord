import { canAccessServer, canManageServer } from "@/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreateChannelForm } from "@/components/forms/create-channel-form";
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/ui/user-menu"
import { SessionGuard } from "@/components/auth/session-guard";

interface CreateChannelPageProps {
  params: { serverId: string }
}

export default async function CreateChannelPage({ params }: CreateChannelPageProps) {
  const { serverId } = await params;

  if (!(await canAccessServer(serverId) || !(await canManageServer(serverId)))) redirect(`/servers/${serverId}`);

  const supabase = await createClient();
  const { data: server, error: serverError } = await supabase.from("servers").select("name").eq("id", serverId).single()
  console.log('create-channel', server, serverError);
  if (serverError || !server) {
    console.error('Error fetching server:', serverError);
    redirect('/dashboard');
  }

  return (
    <SessionGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild className="hover:bg-accent/50">
            <Link href={`/servers/${serverId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Server
            </Link>
          </Button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>

        <CreateChannelForm serverId={serverId} serverName={server.name} />
      </div>
    </SessionGuard>
  )
}