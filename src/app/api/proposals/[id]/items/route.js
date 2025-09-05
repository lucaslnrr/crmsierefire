export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

// List items OR create item
export async function GET(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  try{
    const [items] = await db.execute(`
      SELECT pi.*, s.name AS service_name
      FROM proposal_items pi
      LEFT JOIN services s ON s.id = pi.service_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
    `, [id])
    return NextResponse.json(items)
  } finally {
    await db.end()
  }
}

export async function POST(req, { params }){
  const id = Number(params.id)
  const body = await req.json()
  const db = await getDB()
  try{
    const service_id = body.service_id || null
    const qty  = Number(body.qty || 1)
    const price= Number(body.price || 0)
    const due  = body.due_date || null
    const [r] = await db.execute(
      "INSERT INTO proposal_items (proposal_id, service_id, qty, price, due_date) VALUES (?,?,?,?,?)",
      [id, service_id, qty, price, due]
    )
    // Recalc proposal total
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
    return NextResponse.json({ id: r.insertId })
  } finally {
    await db.end()
  }
}
