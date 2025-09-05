export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function PATCH(req,{params}){
  const id=Number(params.id)
  const b=await req.json()
  const db=await getDB()

  if('status' in b){
    const { status } = b
    await db.execute("UPDATE proposals SET status=?, closed_at=IF(?='APROVADA', NOW(), closed_at) WHERE id=?", [status,status,id])
    if(status==='APROVADA'){
      const [[p]] = await db.execute("SELECT * FROM proposals WHERE id=?", [id])
      const title = (p.description?.trim() ? p.description : `Atividade gerada da Proposta #${id}`) + ` — Proposta #${id}`
      await db.execute("INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE','PROPOSTA',?)", [title, p.company_id, null, null, new Date(), id])
      const [ins] = await db.execute("INSERT INTO sales_orders (company_id, proposal_id, created_by, issue_date, status, notes) VALUES (?,?,?,?, 'ABERTO', ?)", [p.company_id, id, p.created_by||null, new Date().toISOString().slice(0,10), 'Gerado automaticamente da Proposta #'+id])
      const soid = ins.insertId
      await db.execute("UPDATE sales_orders SET order_number=? WHERE id=?", [soid, soid])
    }
    await db.end()
    return NextResponse.json({ ok:true })
  }

  const allowed=['company_id','description','value']
  const sets=[], args=[]
  for(const k of allowed) if(k in b){ sets.push(`${k}=?`); args.push(b[k]) }
  if(sets.length) await db.execute(`UPDATE proposals SET ${sets.join(', ')} WHERE id=?`, [...args, id])
  await db.end()
  return NextResponse.json({ ok:true })
}

export async function DELETE(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  const [[so]] = await db.execute("SELECT id FROM sales_orders WHERE proposal_id=? LIMIT 1", [id])
  if(so){ await db.end(); return NextResponse.json({ error:'Proposta vinculada a Pedido de Venda. Cancele o pedido primeiro.' }, { status:409 }) }
  await db.execute("DELETE FROM proposals WHERE id=?", [id])
  await db.end()
  return NextResponse.json({ ok:true })
}
