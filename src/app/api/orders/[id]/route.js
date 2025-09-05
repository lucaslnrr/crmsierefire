export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  const [[o]] = await db.execute("SELECT so.*, c.nome as company_nome FROM sales_orders so JOIN companies c ON c.id=so.company_id WHERE so.id=?", [id])
  await db.end()
  return new Response(JSON.stringify(o || {}), { headers:{'Content-Type':'application/json'} })
}

export async function PATCH(req,{params}){
  const id=Number(params.id); const b=await req.json()
  const allowed=['due_date','notes','status']
  const sets=[], args=[]
  for(const k of allowed) if(k in b){ sets.push(`${k}=?`); args.push(b[k]||null) }
  if(!sets.length) return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}})
  args.push(id)
  const db=await getDB(); await db.execute(`UPDATE sales_orders SET ${sets.join(', ')} WHERE id=?`, args); await db.end()
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} })
}

export async function DELETE(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  await db.execute("DELETE FROM sales_order_items WHERE order_id=?", [id])
  await db.execute("DELETE FROM sales_orders WHERE id=?", [id])
  await db.end()
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} })
}
