export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(){
  const db=await getDB()
  const [rows]=await db.execute("SELECT * FROM companies ORDER BY id DESC")
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}

export async function POST(req){
  const b=await req.json()
  const db=await getDB()
  const [r]=await db.execute("INSERT INTO companies (nome,cnpj,cpf,caepf,endereco,contato,telefone,email) VALUES (?,?,?,?,?,?,?,?)",[b.nome||'', b.cnpj||null,b.cpf||null,b.caepf||null,b.endereco||null,b.contato||null,b.telefone||null,b.email||null])
  await db.end()
  return new Response(JSON.stringify({ id:r.insertId }), { headers:{'Content-Type':'application/json'} })
}
