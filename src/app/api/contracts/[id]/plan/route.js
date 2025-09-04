export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
function addMonths(iso,n){ const d=new Date(iso); d.setMonth(d.getMonth()+n); return d.toISOString().slice(0,10) }
export async function POST(req,{params}){
  const id=Number(params.id); const { item_id, month_index, date } = await req.json(); if(!item_id || !month_index) return NextResponse.json({error:'item_id e month_index são obrigatórios'},{status:400})
  const db=await getDB(); const [[contract]]=await db.execute("SELECT * FROM contracts WHERE id=?", [id]); const [[item]]=await db.execute("SELECT * FROM contract_items WHERE id=? AND contract_id=?", [item_id,id]); if(!contract||!item){ await db.end(); return NextResponse.json({error:'Contrato/Item inválido'},{status:400}) }
  const monthStart=addMonths(contract.start_date,(month_index-1)); const d0=new Date(monthStart); const startMonth=new Date(d0.getFullYear(),d0.getMonth(),1).toISOString().slice(0,10); const endMonth=new Date(d0.getFullYear(),d0.getMonth()+1,0).toISOString().slice(0,10)
  const [rows]=await db.execute("SELECT * FROM activities WHERE created_from='CONTRATO' AND related_id=? AND DATE(start_datetime) BETWEEN ? AND ? LIMIT 1",[item_id,startMonth,endMonth])
  if(!date){ if(rows[0]) await db.execute("DELETE FROM activities WHERE id=?", [rows[0].id]) }
  else{ if(rows[0]) await db.execute("UPDATE activities SET start_datetime=? WHERE id=?", [`${date} 09:00:00`, rows[0].id]); else{ const [[svc]]=await db.execute("SELECT s.name FROM services s JOIN contract_items ci ON ci.service_id=s.id WHERE ci.id=?", [item_id]); await db.execute(`INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE','CONTRATO',?)`, [`${svc?.name||'Serviço'} — Contrato #${id}`, contract.company_id, item.service_id, null, `${date} 09:00:00`, item_id]) } }
  await db.end(); return NextResponse.json({ ok:true })
}
