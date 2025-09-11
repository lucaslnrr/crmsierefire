import jwt from 'jsonwebtoken'

let cookiesFunc
try{
  const mod = await import('next/headers')
  cookiesFunc = mod.cookies
}catch{
  cookiesFunc = () => ({ get: () => undefined })
}

export function getUserFromCookie(cookieStore = cookiesFunc()){
  const t = cookieStore.get('token')?.value
  if(!t) return null
  try{
    const payload = jwt.verify(t, process.env.JWT_SECRET)
    return payload
  }catch(e){ return null }
}
