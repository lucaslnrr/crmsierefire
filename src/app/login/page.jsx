import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginClient from './page.client'

export const dynamic = 'force-dynamic'

export default function LoginPage(){
  const has = !!cookies().get('token')?.value
  if(has){ redirect('/dashboard') }
  return <LoginClient />
}
