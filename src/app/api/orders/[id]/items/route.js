export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

// Adicionar item ao pedido
export async function POST(req, { params }){
  const id = Number(params.id)
  const b = await req.json()
  const desc = b.description || null
  const service_id = b.service_id || null
  const qty = Number(b.qty || 1)
  const unit = Number(b.unit_price || 0)

  const db = await getDB()
  try {
    await db.execute(
      "INSERT INTO sales_order_items (order_id, service_id, description, qty, unit_price) VALUES (?,?,?,?,?)",
      [id, service_id, desc, qty, unit]
    )
    // recalcula total
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*unit_price),0) AS total FROM sales_order_items WHERE order_id=?", [id])
    await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}