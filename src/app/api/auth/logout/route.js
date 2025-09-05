export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function POST(req){
  const res = NextResponse.redirect(new URL('/login', req.url), { status:303 })
  res.cookies.set('token','', { httpOnly:true, secure:true, sameSite:'lax', path:'/', expires: new Date(0) })
  return res
}
export async function GET(req){
  const res = NextResponse.redirect(new URL('/login', req.url), { status:303 })
  res.cookies.set('token','', { httpOnly:true, secure:true, sameSite:'lax', path:'/', expires: new Date(0) })
  return res
}
