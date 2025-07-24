
import { JoinServerForm } from "@/components/forms/join-server-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionGuard } from "@/components/auth/session-guard"

export default async function JoinServerPage() {
  return (
    <SessionGuard requireAuth={true}>

      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-pink-50/50 dark:from-background dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center p-4">
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

        <JoinServerForm />
      </div>
    </SessionGuard>
  )
}
