export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(req){
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const assigned = searchParams.get('assigned_user_id')
  const status = searchParams.get('status')
  const doc = searchParams.get('doc')
  const where = []; const args=[]
  if(start && end){ where.push("DATE(a.start_datetime) BETWEEN ? AND ?"); args.push(start, end) }
  if(assigned){ where.push("a.assigned_user_id=?"); args.push(assigned) }
  if(status){ where.push("a.status=?"); args.push(status) }
  if(doc){ where.push("(co.cnpj=? OR co.cpf=? OR co.caepf=?)"); args.push(doc,doc,doc) }

  const db=await getDB()
  const [rows]=await db.execute(`
    SELECT a.*, co.nome as company_nome, u.name as profissional
    FROM activities a
    LEFT JOIN companies co ON co.id=a.company_id
    LEFT JOIN users u ON u.id=a.assigned_user_id
    ${where.length?'WHERE '+where.join(' AND '):''}
    ORDER BY a.start_datetime ASC
  `, args)
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}
