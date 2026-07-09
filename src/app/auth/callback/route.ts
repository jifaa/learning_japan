import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // URL to redirect to after sign in process completes
  // This can be passed from the client as a parameter
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
    
    console.error('Error exchanging code for session:', error)
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=Could+not+authenticate+with+Google', request.url))
}
