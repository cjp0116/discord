import { createClient } from '@supabase/supabase-js'

export function createWebSocketClient(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  const client = createClient(supabaseUrl, supabaseAnonKey)

  // If access token is provided, set it for this session
  if (accessToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    })
  }

  return client
} 