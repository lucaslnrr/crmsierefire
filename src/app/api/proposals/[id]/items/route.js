export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

// Add item to proposal and recalc total
export async function POST(req, { params }){
  const id = Number(params.id)
  const b = await req.json()
  const db = await getDB()
  try{
    await db.execute(
      "INSERT INTO proposal_items (proposal_id, service_id, qty, price, due_date) VALUES (?,?,?,?,?)",
      [id, b.service_id, Number(b.qty||1), Number(b.price||0), b.due_date || null]
    )
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}