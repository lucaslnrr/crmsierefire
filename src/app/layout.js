import './globals.css'
import HeaderBar from '../components/ui/HeaderBar'

export const metadata = { title: 'Propostas & Atividades', description: 'Controle de propostas, contratos e agenda' }

export default function RootLayout({ children }){
  return (
    <html lang="pt-BR">
      <body className="sf-body">
        <HeaderBar />
        <main className="sf-container">{children}        </main>
      </body>
    </html>
  )
}
