
import { redirect } from "next/navigation";
import { EditServerForm } from "@/components/forms/edit-server-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { canManageServer } from "@/lib/dal";
import { SessionGuard } from "@/components/auth/session-guard";


export default async function UpdateServerPage({ params }: { params: { serverId: string } }) {
  const { serverId } = await params;
  const supabase = await createClient();
  const { data: server, error: serverError } = await supabase.from("servers").select("*").eq("id", serverId).single();

  if (serverError || !server) {
    console.error("Error fetching server:", serverError)
    redirect("/dashboard")
  }

  if (!(await canManageServer(serverId))) {
    redirect("/dashboard")
  }

  const initialData = {
    name: server.name,
    description: server.description,
  }
  return (
    <SessionGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/50 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild className="hover:bg-accent/50">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <EditServerForm serverId={serverId} initialData={initialData} />
      </div>
    </SessionGuard>
  )
}