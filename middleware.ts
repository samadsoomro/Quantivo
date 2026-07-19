import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Very basic middleware since we don't have supabase SSR in middleware here
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Protect settings route specifically
  if (req.nextUrl.pathname.startsWith('/dashboard/settings')) {
    // If they have no supabase auth cookie, they are guest
    const hasAuthCookie = req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
