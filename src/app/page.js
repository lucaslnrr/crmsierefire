import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

export default function Home(){
  const t = cookies().get('token')?.value
  if (!t) redirect('/login')
  try {
    jwt.verify(t, process.env.JWT_SECRET)
    redirect('/dashboard')
  } catch {
    redirect('/login')
  }
}
