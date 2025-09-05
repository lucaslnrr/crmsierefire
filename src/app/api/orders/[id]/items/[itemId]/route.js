export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

async function recalc(db, orderId){
  const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*unit_price),0) AS total FROM sales_order_items WHERE order_id=?", [orderId])
  await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, orderId])
}

export async function PATCH(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const body = await req.json()
  const db = await getDB()
  try{
    const fields = []
    const vals = []
    if(body.service_id !== undefined){ fields.push("service_id=?"); vals.push(body.service_id) }
    if(body.description !== undefined){ fields.push("description=?"); vals.push(body.description || null) }
    if(body.qty !== undefined){ fields.push("qty=?"); vals.push(Number(body.qty)) }
    if(body.unit_price !== undefined){ fields.push("unit_price=?"); vals.push(Number(body.unit_price)) }
    if(fields.length){
      await db.execute(`UPDATE sales_order_items SET ${fields.join(', ')}, total_price = qty*unit_price WHERE id=? AND order_id=?`, [...vals, itemId, id])
      await recalc(db, id)
    }
    return NextResponse.json({ ok:true })
  } finally {
    await db.end()
  }
}

export async function DELETE(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const db = await getDB()
  try{
    await db.execute("DELETE FROM sales_order_items WHERE id=? AND order_id=?", [itemId, id])
    await recalc(db, id)
    return NextResponse.json({ ok:true })
  } finally {
    await db.end()
  }
}
