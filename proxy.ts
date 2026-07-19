import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const publicRoutes = [
    '/', '/login', '/signup', '/pricing', '/about', '/features', '/faq',
    '/tools',
    '/tools/invoice', '/tools/pdf', '/tools/bank-statement', '/tools/qr-code',
    '/tools/currency-converter', '/tools/loan-calculator', '/tools/expense-report',
    '/tools/budget-planner', '/tools/csv-to-excel', '/tools/terms-generator',
    '/tools/privacy-policy', '/tools/code-explainer', '/tools/product-description',
    '/tools/barcode-generator', '/tools/password-generator',
  ]
  const isPublicRoute = publicRoutes.some(r => pathname === r) || pathname.startsWith('/#')
  const isToolRoute = pathname.startsWith('/tools')

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/auth')

  const isDashboardSettings = pathname.startsWith('/dashboard/settings')
  const isDashboardRoute = pathname.startsWith('/dashboard') && !isDashboardSettings
  const isAllowedForGuest = isPublicRoute || isToolRoute || isApiRoute || isDashboardRoute

  if (!user && !isAllowedForGuest) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
