export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  const [[a]] = await db.execute("SELECT * FROM activities WHERE id=?", [id])
  if (!a) { await db.end(); return new Response(JSON.stringify({ error:'Not found' }), { status:404 }) }
  const [[company]] = await db.execute("SELECT * FROM companies WHERE id=?", [a.company_id])
  const [events] = await db.execute(`
    SELECT e.*, u.name as performed_by_name
    FROM activity_events e
    LEFT JOIN users u ON u.id = e.performed_by
    WHERE e.activity_id=?
    ORDER BY e.event_time DESC, e.id DESC
  `, [id])
  await db.end()
  return new Response(JSON.stringify({ activity: a, company, events }), { headers:{'Content-Type':'application/json'} })
}

export async function PATCH(req,{params}){
  const id=Number(params.id); const b=await req.json()
  const allowed=['title','assigned_user_id','start_datetime','status']
  const sets=[]; const args=[]
  for(const k of allowed){ if(k in b){ sets.push(`${k}=?`); args.push(b[k]||null) } }
  if(!sets.length) return NextResponse.json({ok:true})
  args.push(id)
  const db=await getDB(); await db.execute(`UPDATE activities SET ${sets.join(', ')} WHERE id=?`, args); await db.end()
  return NextResponse.json({ok:true})
}

export async function DELETE(req,{params}){
  const id=Number(params.id); const db=await getDB()
  await db.execute("DELETE FROM activity_events WHERE activity_id=?", [id])
  await db.execute("DELETE FROM activities WHERE id=?", [id])
  await db.end()
  return NextResponse.json({ok:true})
}
