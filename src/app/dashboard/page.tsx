import { Suspense } from "react"
import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ServerListSkeleton } from "@/components/loading/server-skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/ui/user-menu"
import { ServerList } from "@/components/dashboard/server-list"
import { SessionGuard } from "@/components/auth/session-guard"

export default async function DashboardPage() {
  const { user } = await verifySession();
  return (
    <SessionGuard requireAuth={true}>      
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user.display_name || user.username}!
              </h1>
              <p className="text-muted-foreground text-lg">Choose a server to get started</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button asChild className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-300">
                <Link href="/servers/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Server
                </Link>
              </Button>
              <UserMenu />
            </div>
          </div>

          <Suspense fallback={<ServerListSkeleton />}>
            <ServerList />
          </Suspense>
        </div>
      </div>
    </SessionGuard>
  )
}

