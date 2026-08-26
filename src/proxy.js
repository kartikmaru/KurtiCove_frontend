import { NextResponse } from 'next/server'

/**
 * Next.js Edge Proxy — route guard for protected pages.
 * Runs on the edge before any page is rendered.
 * In Next.js 16+, the exported function must be named 'proxy'.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl

  // Read auth token from cookie
  const token = request.cookies.get('auth_token')?.value || request.cookies.get('jwt')?.value

  const isProtected =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/admin')

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin') && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/admin/:path*',
  ],
}
