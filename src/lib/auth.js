import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export function getUserFromCookie(){
  const t = cookies().get('token')?.value
  if(!t) return null
  try{
    const payload = jwt.verify(t, process.env.JWT_SECRET)
    return payload
  }catch(e){ return null }
}
