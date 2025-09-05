export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function PATCH(req, { params }){
  const id = Number(params.id)
  const itemId = Number(params.itemId)
  const body = await req.json()
  const db = await getDB()
  try{
    const fields = []
    const vals = []
    if(body.service_id !== undefined){ fields.push("service_id=?"); vals.push(Number(body.service_id)) }
    if(body.quantity_proposta !== undefined){ fields.push("quantity_proposta=?"); vals.push(Number(body.quantity_proposta)) }
    if(fields.length){
      await db.execute(`UPDATE contract_items SET ${fields.join(', ')} WHERE id=? AND contract_id=?`, [...vals, itemId, id])
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
    await db.execute("DELETE FROM contract_items WHERE id=? AND contract_id=?", [itemId, id])
    return NextResponse.json({ ok:true })
  } finally {
    await db.end()
  }
}
