import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // TEMPORARY: Auth disabled for development
  // TODO: Re-enable auth middleware after creating admin user

  // Public routes - allow without authentication
  const publicPaths = ['/auth/login', '/auth/error', '/auth/signup', '/cadastro']
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // TEMPORARY: Allow all authenticated routes during development
  // In production, uncomment the code below:
  /*
  // Get auth token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Redirect to login if not authenticated
  if (!token && !path.startsWith('/auth')) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only routes
  if (path.startsWith('/admin')) {
    const isAdmin = token?.roles?.includes('ADMIN')
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled by NextAuth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
