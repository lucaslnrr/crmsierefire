export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
export async function POST(req, { params }){
  const id = Number(params.id)
  const { event_type, event_time, new_datetime, performed_by, notes, evidence_url } = await req.json()
  if (!event_type || !event_time) return NextResponse.json({ error:'event_type e event_time são obrigatórios' }, { status:400 })
  const db = await getDB()
  const [[a]] = await db.execute("SELECT * FROM activities WHERE id=?", [id])
  if (!a) { await db.end(); return NextResponse.json({ error:'Atividade não encontrada' }, { status:404 }) }
  await db.execute(`
    INSERT INTO activity_events (activity_id, event_type, event_time, new_datetime, performed_by, notes, evidence_url)
    VALUES (?,?,?,?,?,?,?)
  `, [id, event_type, event_time, new_datetime || null, performed_by || null, notes || null, evidence_url || null])
  if (event_type === 'EXECUTED') {
    await db.execute("UPDATE activities SET status='CONCLUIDA', end_datetime=? WHERE id=?", [event_time, id])
  } else if (event_type === 'RESCHEDULED' && new_datetime) {
    await db.execute("UPDATE activities SET start_datetime=?, status='PENDENTE' WHERE id=?", [new_datetime, id])
  }
  await db.end()
  return NextResponse.json({ ok:true })
}
