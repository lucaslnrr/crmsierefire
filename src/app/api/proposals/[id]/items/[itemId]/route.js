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
    if(body.service_id !== undefined){ fields.push("service_id=?"); vals.push(body.service_id) }
    if(body.qty !== undefined){ fields.push("qty=?"); vals.push(Number(body.qty)) }
    if(body.price !== undefined){ fields.push("price=?"); vals.push(Number(body.price)) }
    if(body.due_date !== undefined){ fields.push("due_date=?"); vals.push(body.due_date || null) }
    if(fields.length){
      await db.execute(`UPDATE proposal_items SET ${fields.join(', ')} WHERE id=? AND proposal_id=?`, [...vals, itemId, id])
      const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
      await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
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
    await db.execute("DELETE FROM proposal_items WHERE id=? AND proposal_id=?", [itemId, id])
    const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, id])
    return NextResponse.json({ ok:true })
  } finally {
    await db.end()
  }
}
