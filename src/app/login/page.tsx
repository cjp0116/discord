
import { LoginForm } from "@/components/auth/login-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { SessionGuard } from "@/components/auth/session-guard"

export default async function LoginPage() {
  return (
    <SessionGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
        
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-4 relative z-10">
          <LoginForm />
          <p className="text-center text-white/90">
            Need an account?{" "}
            <Link href="/signup" className="underline hover:no-underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </SessionGuard>
  )
}
