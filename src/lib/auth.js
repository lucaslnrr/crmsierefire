import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
export function signToken(user){ return jwt.sign({id:user.id,role:user.role,name:user.name,email:user.email}, process.env.JWT_SECRET, {expiresIn:'7d'}) }
export function getUserFromCookie(){ try{ const t=cookies().get('token')?.value; if(!t) return null; return jwt.verify(t, process.env.JWT_SECRET) }catch(e){ return null } }
