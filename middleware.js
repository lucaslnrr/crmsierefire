import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Public routes (no auth)
const PUBLIC = ['/login', '/api/auth/login', '/api/auth/logout']

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Root (/) → decide based on VALID token (not just presence)
  if (pathname === '/') {
    const t = req.cookies.get('token')?.value
    if (!t) return NextResponse.redirect(new URL('/login', req.url))
    try {
      jwt.verify(t, process.env.JWT_SECRET)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // All other non-public paths must have a VALID token
  const t = req.cookies.get('token')?.value
  if (!t) return NextResponse.redirect(new URL('/login', req.url))
  try {
    jwt.verify(t, process.env.JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// IMPORTANT: explicitly include "/" and exclude static/image assets
export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
