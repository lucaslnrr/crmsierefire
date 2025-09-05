export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(req,{params}){
  const id = Number(params.id)
  const db = await getDB()
  try{
    const [[p]] = await db.execute(`
      SELECT p.*, c.nome AS company_nome, so.id AS order_id, so.order_number, ct.id AS contract_id, ct.activity_id AS contract_activity_id
      FROM proposals p
      JOIN companies c ON c.id=p.company_id
      LEFT JOIN sales_orders so ON so.proposal_id=p.id
      LEFT JOIN contracts ct ON ct.proposal_id=p.id
      WHERE p.id=?
    `,[id])
    const [items] = await db.execute(`
      SELECT pi.*, s.name AS service_name
      FROM proposal_items pi
      LEFT JOIN services s ON s.id = pi.service_id
      WHERE pi.proposal_id=?
      ORDER BY pi.id ASC
    `,[id])
    return NextResponse.json({ ...(p||{}), items })
  } finally {
    await db.end()
  }
}

// Update proposal; when status becomes 'APROVADA', convert to sales order (if not exists), ensure one-to-one links via contracts
export async function PATCH(req,{params}){
  const id = Number(params.id)
  const body = await req.json()
  const db = await getDB()
  try {
    // Read current
    const [[p]] = await db.execute("SELECT * FROM proposals WHERE id=?", [id])
    if(!p) return NextResponse.json({ error: 'Proposta não encontrada' }, { status:404 })

    // Update base fields
    const fields = []
    const args = []
    if(body.company_id !== undefined){ fields.push("company_id=?"); args.push(body.company_id) }
    if(body.description !== undefined){ fields.push("description=?"); args.push(body.description) }
    if(body.value !== undefined){ fields.push("value=?"); args.push(body.value) }
    if(body.status !== undefined){ fields.push("status=?"); args.push(body.status) }

    if(fields.length){
      await db.execute(`UPDATE proposals SET ${fields.join(', ')} WHERE id=?`, [...args, id])
    }

    let created_order_id = null

    if(body.status && String(body.status).toUpperCase() === 'APROVADA'){
      // 1) Ensure Sales Order exists
      const [[existing]] = await db.execute("SELECT id FROM sales_orders WHERE proposal_id=? LIMIT 1", [id])
      let order_id = existing ? existing.id : null
      if(!order_id){
        const [[{ total }]] = await db.execute("SELECT COALESCE(SUM(qty*price),0) AS total FROM proposal_items WHERE proposal_id=?", [id])
        const [[{ max_due }]] = await db.execute("SELECT MAX(due_date) AS max_due FROM proposal_items WHERE proposal_id=?", [id])
        const [r] = await db.execute(
          "INSERT INTO sales_orders (proposal_id, company_id, issue_date, due_date, status, notes, total_value) VALUES (?,?,CURRENT_DATE(), ?, 'ABERTO', ?, ?)",
          [p.company_id, max_due || null, p.description || null, total || 0]
        )
        order_id = r.insertId
        await db.execute("UPDATE sales_orders SET order_number=? WHERE id=?", [order_id, order_id])
        const [pi] = await db.execute(
          "SELECT pi.service_id, pi.qty, pi.price, s.name AS service_name FROM proposal_items pi LEFT JOIN services s ON s.id=pi.service_id WHERE pi.proposal_id=?",
          [id]
        )
        for(const it of pi){
          await db.execute(
            "INSERT INTO sales_order_items (order_id, service_id, description, qty, unit_price) VALUES (?,?,?,?,?)",
            [order_id, it.service_id || null, it.service_name || null, it.qty || 1, it.price || 0]
          )
        }
        await db.execute("UPDATE sales_orders SET total_value=? WHERE id=?", [total || 0, order_id])
      }
      created_order_id = order_id

      // 2) Ensure Contract exists and is linked 1:1 to Proposal and Order
      const [[ct]] = await db.execute("SELECT * FROM contracts WHERE proposal_id=? OR sales_order_id=? LIMIT 1", [id, order_id])
      let contract_id = ct ? ct.id : null
      if(!contract_id){
        const [rc] = await db.execute(
          "INSERT INTO contracts (company_id, proposal_id, sales_order_id, status, notes) VALUES (?,?,?,?,?)",
          [p.company_id, id, order_id, 'ATIVO', p.description || null]
        )
        contract_id = rc.insertId
      } else {
        // Repair missing links if any
        if(ct.proposal_id == null){ await db.execute("UPDATE contracts SET proposal_id=? WHERE id=?", [id, ct.id]) }
        if(ct.sales_order_id == null){ await db.execute("UPDATE contracts SET sales_order_id=? WHERE id=?", [order_id, ct.id]) }
      }

      // 3) Ensure a single Activity exists and link it to Contract (created_from='CONTRATO')
      const [[act]] = await db.execute("SELECT id FROM activities WHERE created_from='CONTRATO' AND related_id=? LIMIT 1", [contract_id])
      let activity_id = act ? act.id : null
      if(!activity_id){
        const title = `Execução do contrato #${contract_id}`
        const [ra] = await db.execute(
          "INSERT INTO activities (company_id, title, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?,?)",
          [p.company_id, title, new Date(), 'PENDENTE', 'CONTRATO', contract_id]
        )
        activity_id = ra.insertId
      }
      // Link activity to contract if not set
      await db.execute("UPDATE contracts SET activity_id=? WHERE id=? AND (activity_id IS NULL OR activity_id=0)", [activity_id, contract_id])
    }

    return NextResponse.json({ ok:true, order_id: created_order_id })
  } finally {
    await db.end()
  }
}

export async function DELETE(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  try{
    const [[so]] = await db.execute("SELECT id FROM sales_orders WHERE proposal_id=? LIMIT 1", [id])
    if(so){
      return NextResponse.json({ error:'Proposta já vinculada a um Pedido de Venda. Cancele o pedido primeiro.' }, { status:409 })
    }
    await db.execute("DELETE FROM proposals WHERE id=?", [id])
    return NextResponse.json({ ok:true })
  } finally {
    await db.end()
  }
}