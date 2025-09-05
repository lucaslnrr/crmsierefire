export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'
export async function GET(){
  const db=await getDB()
  const [rows]=await db.execute(`SELECT c.*, co.nome as company_nome FROM contracts c JOIN companies co ON co.id=c.company_id ORDER BY c.id DESC`)
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}
export async function POST(req){
  const b=await req.json()
  const db=await getDB()
  const [r]=await db.execute("INSERT INTO contracts (company_id,start_date,end_date,monthly_value,status) VALUES (?,?,?,?,?)",[b.company_id,b.start_date,b.end_date||null,b.monthly_value||0,b.status||'ATIVO'])
  await db.end()
  return new Response(JSON.stringify({ id:r.insertId }), { headers:{'Content-Type':'application/json'} })
}
