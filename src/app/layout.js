import './globals.css'

export const metadata = { title: 'Propostas & Atividades', description: 'Controle de propostas, contratos e agenda' }

export default function RootLayout({ children }){
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
