import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the session to access the access token
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({ 
      data: { 
        user,
        session: session ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        } : null
      } 
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
} 