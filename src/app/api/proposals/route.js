export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'

export async function GET(){
  const db=await getDB()
  const [rows]=await db.execute(`SELECT p.*, c.nome as company_nome FROM proposals p JOIN companies c ON c.id=p.company_id ORDER BY p.id DESC`)
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}

export async function POST(req){
  const b=await req.json()
  const db=await getDB()
  const [r]=await db.execute("INSERT INTO proposals (company_id,created_by,description,value,status) VALUES (?,?,?,?, 'RASCUNHO')",[b.company_id,b.created_by||null,b.description||null,b.value||0])
  await db.end()
  return new Response(JSON.stringify({ id:r.insertId }), { headers:{'Content-Type':'application/json'} })
}
