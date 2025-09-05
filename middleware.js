import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
const PUBLIC=['/login','/api/auth/login','/api/auth/logout']
export function middleware(req){
  const p=req.nextUrl.pathname;
  if(p==='/'||p===''){ const hasToken=!!req.cookies.get('token')?.value; return NextResponse.redirect(new URL(hasToken?'/dashboard':'/login', req.url)) }
  if(PUBLIC.some(x=>p.startsWith(x))) return NextResponse.next();
  const t=req.cookies.get('token')?.value; if(!t) return NextResponse.redirect(new URL('/login', req.url));
  try{ jwt.verify(t, process.env.JWT_SECRET); return NextResponse.next() }catch(e){ return NextResponse.redirect(new URL('/login', req.url)) }
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] }
