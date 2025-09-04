export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import cookie from 'cookie'
export async function POST(req){
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error:'Email e senha são obrigatórios' }, { status:400 })
  const db=await getDB(); const [rows]=await db.execute("SELECT * FROM users WHERE email=? LIMIT 1",[email]); await db.end()
  const user=rows[0]; if(!user) return NextResponse.json({ error:'Credenciais inválidas' },{ status:401 })
  const ok = await bcrypt.compare(password, user.password_hash); if(!ok) return NextResponse.json({ error:'Credenciais inválidas' },{ status:401 })
  if (!['comercial','diretoria'].includes(user.role)) return NextResponse.json({ error:'Acesso negado' },{ status:403 })
  const token = signToken(user); const res = NextResponse.json({ ok:true })
  res.headers.set('Set-Cookie', cookie.serialize('token', token, { httpOnly:true, secure:true, sameSite:'lax', path:'/', maxAge:7*24*3600 }))
  return res
}
