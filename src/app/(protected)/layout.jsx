export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromCookie } from '@/lib/auth'

export default function ProtectedLayout({ children }){
  const user = getUserFromCookie()
  if(!user){ redirect('/login') }
  return (
    <html lang="pt-BR">
      <body>
        <nav className="navbar">
          <div className="container inner">
            <div className="left">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/calendar">Calendário</Link>
              <Link href="/companies">Empresas</Link>
              <Link href="/proposals">Propostas</Link>
              <Link href="/contracts">Contratos</Link>
              <Link href="/orders">Pedidos</Link>
            </div>
            <div className="right">
              <form action="/api/auth/logout" method="post"><button className="btn danger">Sair</button></form>
            </div>
          </div>
        </nav>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  )
}
