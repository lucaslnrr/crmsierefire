import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function Home(){
  const has = !!cookies().get('token')?.value
  redirect(has?'/dashboard':'/login')
}
