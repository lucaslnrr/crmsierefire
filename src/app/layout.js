import './globals.css'
import Link from 'next/link'

export const metadata = { title:'Propostas & Atividades', description:'Controle de propostas, contratos e agenda' }
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR"><body>
      <nav className="bg-white border-b border-gray-200">
        <div className="container h-14 flex items-center justify-between">
          <div className="flex gap-3">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/calendar">Calendário</Link>
            <Link href="/companies">Empresas</Link>
            <Link href="/proposals">Propostas</Link>
            <Link href="/contracts">Contratos</Link>
          </div>
          <form action="/api/auth/logout" method="post"><button className="text-sm text-red-600">Sair</button></form>
        </div>
      </nav>
      <main className="container py-6">{children}</main>
    </body></html>
  )
}
