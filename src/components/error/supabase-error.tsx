import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

export function SupabaseError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <CardTitle>Configuration Required</CardTitle>
          </div>
          <CardDescription>Supabase environment variables are missing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To use this Discord clone, you need to set up Supabase environment variables.
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Required Environment Variables:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• NEXT_PUBLIC_SUPABASE_URL</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Setup Instructions:</h4>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. Create a Supabase project</li>
              <li>2. Copy .env.local.example to .env.local</li>
              <li>3. Fill in your Supabase credentials</li>
              <li>4. Run the SQL scripts to set up the database</li>
            </ol>
          </div>

          <Button asChild className="w-full">
            <Link href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
