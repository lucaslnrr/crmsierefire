export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  try{
    const [items] = await db.execute(`
      SELECT soi.*, s.name AS service_name
      FROM sales_order_items soi
      LEFT JOIN services s ON s.id = soi.service_id
      WHERE soi.order_id = ?
      ORDER BY soi.id ASC
    `, [id])
    return NextResponse.json(items)
  } finally {
    await db.end()
  }
}

async function recalc(db, orderId){
  const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*unit_price),0) AS total FROM sales_order_items WHERE order_id=?", [orderId])
  await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, orderId])
}

export async function POST(req, { params }){
  const id = Number(params.id)
  const body = await req.json()
  const db = await getDB()
  try{
    const service_id = body.service_id || null
    const qty  = Number(body.qty || 1)
    const unit_price = Number(body.unit_price || 0)
    let description = body.description || null
    if(!description && service_id){
      const [[s]] = await db.execute("SELECT name FROM services WHERE id=?",[service_id])
      description = s?.name || null
    }
    const [r] = await db.execute(
      "INSERT INTO sales_order_items (order_id, service_id, description, qty, unit_price, total_price) VALUES (?,?,?,?,?, qty*unit_price)",
      [ id, service_id, description, qty, unit_price ]
    )
    await recalc(db, id)
    return NextResponse.json({ id: r.insertId })
  } finally {
    await db.end()
  }
}
