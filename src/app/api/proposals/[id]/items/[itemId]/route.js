export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function PATCH(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const b = await req.json()
  const sets=[]; const args=[]
  if(b.service_id !== undefined){ sets.push("service_id=?"); args.push(b.service_id) }
  if(b.qty !== undefined){ sets.push("qty=?"); args.push(Number(b.qty||1)) }
  if(b.price !== undefined){ sets.push("price=?"); args.push(Number(b.price||0)) }
  if(b.due_date !== undefined){ sets.push("due_date=?"); args.push(b.due_date || null) }
  if(!sets.length) return new Response(JSON.stringify({ok:true}), { headers:{ 'Content-Type':'application/json' } })

  const db = await getDB()
  try{
    await db.execute(`UPDATE proposal_items SET ${sets.join(', ')} WHERE id=? AND proposal_id=?`, [...args, itemId, id])
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ok:true}), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}

export async function DELETE(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const db = await getDB()
  try{
    await db.execute("DELETE FROM proposal_items WHERE id=? AND proposal_id=?", [itemId, id])
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ok:true}), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}