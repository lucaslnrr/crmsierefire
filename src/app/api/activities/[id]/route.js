export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'
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
