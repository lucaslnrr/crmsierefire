export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getDB } from '@/lib/db'
export async function GET(req){
  const { searchParams } = new URL(req.url)
  const start=searchParams.get('start'); const end=searchParams.get('end'); const assigned=searchParams.get('assigned_user_id'); const status=searchParams.get('status'); const doc=searchParams.get('doc')
  let sql=`SELECT a.*, u.name as profissional, c.nome as company_nome, c.cnpj, c.cpf, c.caepf FROM activities a LEFT JOIN users u ON u.id=a.assigned_user_id LEFT JOIN companies c ON c.id=a.company_id WHERE 1=1`
  const args=[]; if(start){ sql+=" AND DATE(a.start_datetime) >= ?"; args.push(start) } if(end){ sql+=" AND DATE(a.start_datetime) <= ?"; args.push(end) } if(assigned){ sql+=" AND a.assigned_user_id = ?"; args.push(assigned) } if(status){ sql+=" AND a.status = ?"; args.push(status) } if(doc){ sql+=" AND (c.cnpj=? OR c.cpf=? OR c.caepf=?)"; args.push(doc,doc,doc) } sql+=" ORDER BY a.start_datetime ASC"
  const db=await getDB(); const [rows]=await db.execute(sql,args); await db.end()
  const now=new Date(); rows.forEach(r=>{ const d = (r.start_datetime instanceof Date) ? r.start_datetime : new Date(r.start_datetime); if(r.status!=='CONCLUIDA' && d < now) r.status='EM_ATRASO' })
  return new Response(JSON.stringify(rows), { headers:{'Content-Type':'application/json'} })
}
