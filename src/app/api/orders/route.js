export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'

export async function GET(){
  const db=await getDB()
  const [rows]=await db.execute(`SELECT so.*, c.nome as company_nome FROM sales_orders so JOIN companies c ON c.id=so.company_id ORDER BY so.id DESC`)
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}
