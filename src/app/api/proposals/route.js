export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(){
  const db = await getDB()
  const [rows] = await db.execute(`
    SELECT p.*,
           c.nome AS company_nome,
           so.id AS order_id,
           so.order_number AS order_number,
           ct.id AS contract_id
    FROM proposals p
    JOIN companies c ON c.id = p.company_id
    LEFT JOIN sales_orders so ON so.proposal_id = p.id
    LEFT JOIN contracts ct ON ct.proposal_id = p.id
    ORDER BY p.id DESC
  `)
  await db.end()
  return new Response(JSON.stringify(rows), { headers:{ 'Content-Type':'application/json' } })
}

export async function POST(req){
  const b = await req.json()
  const db = await getDB()
  try{
    const [r] = await db.execute(
      "INSERT INTO proposals (company_id, created_by, description, value, status) VALUES (?, ?, ?, 0, 'RASCUNHO')",
      [b.company_id, b.created_by || null, b.description || null]
    )
    const proposal_id = r.insertId
    const items = Array.isArray(b.items) ? b.items : []
    let total = 0
    for(const it of items){
      const service_id = it.service_id || null
      const qty  = Number(it.qty || 1)
      const price= Number(it.price || 0)
      const due  = it.due_date || null
      total += qty * price
      await db.execute(
        "INSERT INTO proposal_items (proposal_id, service_id, qty, price, due_date) VALUES (?,?,?,?,?)",
        [proposal_id, service_id, qty, price, due]
      )
    }
    await db.execute("UPDATE proposals SET value=? WHERE id=?", [total, proposal_id])
    return new Response(JSON.stringify({ id: proposal_id }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}