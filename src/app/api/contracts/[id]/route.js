export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'

function toDate(v){ return (v instanceof Date) ? v : new Date(v) }
function toISODate(v){ const d=toDate(v); if(!d||isNaN(d)) return ''; const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}` }
function monthDiff(a,b){ const s=toDate(a); const t=toDate(b); return (t.getFullYear()-s.getFullYear())*12 + (t.getMonth()-s.getMonth()) + 1 }
function daysBetween(a,b){ const da=toDate(a), db=toDate(b); const A=new Date(da.getFullYear(),da.getMonth(),da.getDate()); const B=new Date(db.getFullYear(),db.getMonth(),db.getDate()); return Math.round((B-A)/(1000*60*60*24)) }

export async function GET(req,{params}){
  const id=Number(params.id); const db=await getDB()
  const [[contract]]=await db.execute("SELECT * FROM contracts WHERE id=?", [id])
  const [[company]]=await db.execute("SELECT * FROM companies WHERE id=?", [contract.company_id])
  const [items]=await db.execute("SELECT ci.*, s.name as service_name FROM contract_items ci JOIN services s ON s.id=ci.service_id WHERE ci.contract_id=? ORDER BY ci.id", [id])

  let acts = []
  if(items.length){
    const ids = items.map(i=>i.id)
    const placeholders = ids.map(()=>'?').join(',')
    const [rows] = await db.execute(`SELECT * FROM activities WHERE created_from='CONTRATO' AND related_id IN (${placeholders})`, ids)
    acts = rows
  }
  await db.end()

  const todayISO=toISODate(new Date()); const grid={}; items.forEach(it=>grid[it.id]={})
  acts.forEach(a=>{ const idx=monthDiff(contract.start_date, a.start_datetime); if(idx>=1 && idx<=12){ const date=toISODate(a.start_datetime); const days=daysBetween(todayISO, date); grid[a.related_id][idx]={ date, days_to_action:days } } })
  items.forEach(it=>{ for(let i=1;i<=12;i++){ if(!grid[it.id][i]) grid[it.id][i]={ date:'', days_to_action:null } } })
  const itemsWithIndex = items.map((it,idx)=>({ ...it, item_index: idx+1 }))
  return new Response(JSON.stringify({ contract, company, items: itemsWithIndex, grid }), { headers:{'Content-Type':'application/json'} })
}
