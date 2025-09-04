export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'
export async function GET(){ const db=await getDB(); const [rows]=await db.execute("SELECT ct.*, c.nome as company_nome FROM contracts ct JOIN companies c ON c.id=ct.company_id ORDER BY ct.id DESC"); await db.end(); return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} }) }
export async function POST(req){
  const b=await req.json();
  const db=await getDB();
  const [r]=await db.execute(
    "INSERT INTO contracts (company_id, proposal_id, start_date, end_date, monthly_value, status, notes) VALUES (?,?,?,?,?,'ATIVO',?)",
    [b.company_id,b.proposal_id||null,b.start_date,b.end_date||null,b.monthly_value||null,b.notes||null]
  );
  const cid=r.insertId;
  if(Array.isArray(b.items)){
    for(const it of b.items){
      if(!it.service_id) continue;
      const [ri]=await db.execute("INSERT INTO contract_items (contract_id, service_id, quantity_proposta) VALUES (?,?,?)",[cid,it.service_id,it.quantity_proposta||1]);
      const start = `${b.start_date} 09:00:00`;
      const [[svc]] = await db.execute("SELECT name FROM services WHERE id=?", [it.service_id]);
      await db.execute(
        `INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE','CONTRATO',?)`,
        [`${svc?.name||'Serviço'} — Contrato #${cid}`, b.company_id, it.service_id, null, start, ri.insertId]
      );
    }
  }
  await db.end();
  return new Response(JSON.stringify({ok:true,id:cid}), { headers:{'Content-Type':'application/json'} })
}
