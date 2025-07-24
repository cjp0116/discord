import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { SessionGuard } from "@/components/auth/session-guard"
export default async function HomePage() {

  return (
  
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="text-center text-white space-y-8 relative z-10">
          <div className="space-y-6">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
              DISCORD
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Imagine a place where you can belong to a school club, a gaming group, or a worldwide art community.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
