export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(){
  const db = await getDB()
  const [rows] = await db.execute(`
    SELECT so.id, so.order_number, so.company_id, c.nome AS company_nome,
           DATE_FORMAT(so.issue_date, '%Y-%m-%d') AS issue_date,
           DATE_FORMAT(so.due_date,   '%Y-%m-%d') AS due_date,
           so.status, so.total_value
    FROM sales_orders so
    JOIN companies c ON c.id = so.company_id
    ORDER BY so.id DESC
  `)
  await db.end()
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type':'application/json' } })
}

export async function POST(req){
  const b = await req.json()
  const company_id = Number(b.company_id)
  if(!company_id) return new Response(JSON.stringify({ ok:false, error:'company_id obrigatório' }), { status:400 })

  const issue_date = b.issue_date || new Date().toISOString().slice(0,10)
  const due_date   = b.due_date   || null
  const status     = b.status     || 'Aberto'
  const notes      = b.notes      || null
  const items      = Array.isArray(b.items) ? b.items : []

  const db = await getDB()
  try {
    const [r] = await db.execute(
      "INSERT INTO sales_orders (company_id, issue_date, due_date, status, notes, total_value) VALUES (?,?,?,?,?,0)",
      [company_id, issue_date, due_date, status, notes]
    )
    const order_id = r.insertId
    await db.execute("UPDATE sales_orders SET order_number=? WHERE id=?", [order_id, order_id])

    let total = 0
    for(const it of items){
      const desc = it.description || it.desc || null
      const qty  = Number(it.qty || it.quantity || 1)
      const unit = Number(it.unit_price || it.price || 0)
      total += qty * unit
      await db.execute(
        "INSERT INTO sales_order_items (order_id, service_id, description, qty, unit_price) VALUES (?,?,?,?,?)",
        [order_id, it.service_id || null, desc, qty, unit]
      )
    }
    await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total, order_id])

    return new Response(JSON.stringify({ ok:true, id: order_id }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}