export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'
export async function GET(){ const db=await getDB(); const [rows]=await db.execute("SELECT id,name FROM users ORDER BY name ASC"); await db.end(); return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} }) }
