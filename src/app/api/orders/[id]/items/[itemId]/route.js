export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

// Atualizar ou remover item
export async function PATCH(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const b = await req.json()
  const fields = []
  const args = []
  if(b.description !== undefined){ fields.push("description=?"); args.push(b.description || null) }
  if(b.service_id  !== undefined){ fields.push("service_id=?");  args.push(b.service_id || null) }
  if(b.qty         !== undefined){ fields.push("qty=?");         args.push(Number(b.qty||1)) }
  if(b.unit_price  !== undefined){ fields.push("unit_price=?");  args.push(Number(b.unit_price||0)) }
  if(!fields.length) return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })

  const db = await getDB()
  try {
    await db.execute(`UPDATE sales_order_items SET ${fields.join(', ')} WHERE id=? AND order_id=?`, [...args, itemId, id])
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*unit_price),0) AS total FROM sales_order_items WHERE order_id=?", [id])
    await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}

export async function DELETE(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const db = await getDB()
  try {
    await db.execute("DELETE FROM sales_order_items WHERE id=? AND order_id=?", [itemId, id])
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*unit_price),0) AS total FROM sales_order_items WHERE order_id=?", [id])
    await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}