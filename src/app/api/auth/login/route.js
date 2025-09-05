export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req){
  const { email, password } = await req.json()
  const db = await getDB()
  const [rows] = await db.execute("SELECT id,name,email,password_hash,role FROM users WHERE email=?", [email])
  await db.end()
  const u = rows?.[0]
  if(!u || !(u.password_hash && bcrypt.compareSync(password, u.password_hash))){
    return new NextResponse('Unauthorized', { status:401 })
  }
  const token = jwt.sign({ id:u.id, name:u.name, email:u.email, role:u.role }, process.env.JWT_SECRET, { expiresIn:'7d' })
  const res = NextResponse.json({ ok:true })
  res.cookies.set('token', token, { httpOnly:true, secure:true, sameSite:'lax', path:'/' })
  return res
}
