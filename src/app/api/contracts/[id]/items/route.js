export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  try{
    const [items] = await db.execute(`
      SELECT ci.*, s.name AS service_name
      FROM contract_items ci
      LEFT JOIN services s ON s.id = ci.service_id
      WHERE ci.contract_id = ?
      ORDER BY ci.id ASC
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
    const service_id = Number(body.service_id)
    const quantity_proposta = Number(body.quantity_proposta || 1)
    const [r] = await db.execute(
      "INSERT INTO contract_items (contract_id, service_id, quantity_proposta) VALUES (?,?,?)",
      [id, service_id, quantity_proposta]
    )
    return NextResponse.json({ id: r.insertId })
  } finally {
    await db.end()
  }
}
