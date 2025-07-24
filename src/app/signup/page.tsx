
import { SignUpForm } from "@/components/auth/signup-form"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { SessionGuard } from "@/components/auth/session-guard"

export default async function SignUpPage() {
  // const user = await getUser()
  // if (user) {
  //   redirect('/dashboard')
  // }

  return (
    <SessionGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
        
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-4 relative z-10">
          <SignUpForm />
          <p className="text-center text-white/90">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:no-underline font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </SessionGuard>
  )
};

