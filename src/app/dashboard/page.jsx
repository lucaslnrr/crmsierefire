export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getDB } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import Link from 'next/link'

async function getData(){
  const db=await getDB()
  const [issued]=await db.execute("SELECT COUNT(*) c FROM proposals WHERE DATE(issued_at)=CURDATE()")
  const [closed]=await db.execute("SELECT COUNT(*) c FROM proposals WHERE status='APROVADA' AND DATE(IFNULL(closed_at, issued_at))=CURDATE()")
  const [acts]=await db.execute(`SELECT a.id,a.title,a.start_datetime,a.status,u.name as profissional FROM activities a LEFT JOIN users u ON u.id=a.assigned_user_id WHERE DATE(a.start_datetime) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 DAY) ORDER BY a.start_datetime ASC LIMIT 8`)
  await db.end(); return {issued:issued[0]?.c||0, closed:closed[0]?.c||0, acts}
}
export default async function Dashboard(){
  const user=getUserFromCookie(); const {issued,closed,acts}=await getData()
  return (<div className="space-y-6">
    <h1 className="text-2xl font-semibold">Dashboard</h1>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card"><div className="text-sm text-gray-500">Propostas emitidas hoje</div><div className="text-3xl font-bold">{issued}</div></div>
      <div className="card"><div className="text-sm text-gray-500">Propostas fechadas hoje</div><div className="text-3xl font-bold">{closed}</div></div>
      <div className="card"><div className="text-sm text-gray-500">Perfil</div><div className="text-lg">{user?.role}</div></div>
    </div>
    <div className="card">
      <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">Programação da Semana</h2><Link className="text-sm text-accent" href="/calendar">Ver calendário</Link></div>
      <ul className="divide-y">{acts.map(a=>(<li key={a.id} className="py-2 flex items-center justify-between"><div><div className="font-medium">{a.title}</div><div className="text-sm text-gray-500">{new Date(a.start_datetime).toLocaleString('pt-BR')} • {a.profissional||'—'}</div></div><a className="text-sm text-accent" href={`/activities/${a.id}`}>Abrir</a></li>))}
      {acts.length===0 && <li className="text-sm text-gray-500">Sem atividades próximas.</li>}</ul>
    </div>
  </div>)
}
