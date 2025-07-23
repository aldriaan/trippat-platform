import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isRootPage = request.nextUrl.pathname === '/'

  // If user has token and tries to access login or root, redirect to dashboard
  if (token && (isLoginPage || isRootPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user doesn't have token and tries to access dashboard, redirect to login
  if (!token && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user doesn't have token and tries to access root, redirect to login
  if (!token && isRootPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}