export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function POST(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  const [[c]] = await db.execute("SELECT * FROM contracts WHERE id=?", [id])
  const [items] = await db.execute("SELECT ci.*, s.name as service_name FROM contract_items ci JOIN services s ON s.id=ci.service_id WHERE ci.contract_id=?", [id])
  for(const it of items){
    for(let i=0;i<12;i++){
      const d=new Date(c.start_date); d.setMonth(d.getMonth()+i); const when = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12,0,0))
      await db.execute("INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE', 'CONTRATO', ?)", [`${it.service_name} — M${i+1}`, c.company_id, it.service_id, null, when, it.id])
    }
  }
  await db.end()
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} })
}
