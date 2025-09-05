export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'

export async function GET(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  try {
    const [[o]] = await db.execute(`
      SELECT so.*, c.nome AS company_nome,
             DATE_FORMAT(so.issue_date, '%Y-%m-%d') AS issue_date_fmt,
             DATE_FORMAT(so.due_date,   '%Y-%m-%d') AS due_date_fmt
      FROM sales_orders so
      JOIN companies c ON c.id = so.company_id
      WHERE so.id=?
    `, [id])

    const [items] = await db.execute(
      "SELECT id, service_id, description, qty, unit_price, (qty*unit_price) AS total FROM sales_order_items WHERE order_id=? ORDER BY id ASC",
      [id]
    )

    return new Response(JSON.stringify({ ...(o||{}), items }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}

export async function PATCH(req, { params }){
  const id = Number(params.id)
  const b = await req.json()
  const fields = []
  const args = []
  if(b.due_date !== undefined){ fields.push("due_date=?"); args.push(b.due_date || null) }
  if(b.status   !== undefined){ fields.push("status=?");   args.push(b.status || null) }
  if(b.notes    !== undefined){ fields.push("notes=?");    args.push(b.notes || null) }

  if(!fields.length){
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  }

  const db = await getDB()
  try {
    await db.execute(`UPDATE sales_orders SET ${fields.join(', ')} WHERE id=?`, [...args, id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}

export async function DELETE(req, { params }){
  const id = Number(params.id)
  const db = await getDB()
  try {
    await db.execute("DELETE FROM sales_order_items WHERE order_id=?", [id])
    await db.execute("DELETE FROM sales_orders WHERE id=?", [id])
    return new Response(JSON.stringify({ ok:true }), { headers:{ 'Content-Type':'application/json' } })
  } finally {
    await db.end()
  }
}