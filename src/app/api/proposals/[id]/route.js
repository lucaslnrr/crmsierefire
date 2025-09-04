export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import nodemailer from 'nodemailer'
async function sendMail(subject, html){ if(!process.env.SMTP_HOST){ console.log('[MAIL disabled]',subject); return } const transporter=nodemailer.createTransport({ host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT||587), secure:false, auth:{ user:process.env.SMTP_USER, pass:process.env.SMTP_PASS } }); await transporter.sendMail({ from:process.env.MAIL_FROM||'noreply@example.com', to:[process.env.MAIL_TO_BILLING||'',process.env.MAIL_TO_TECH||''].filter(Boolean).join(','), subject, html }) }
export async function PATCH(req,{params}){
  const id=Number(params.id);
  const { status } = await req.json();
  const db=await getDB();
  await db.execute("UPDATE proposals SET status=?, closed_at=IF(?='APROVADA', NOW(), closed_at) WHERE id=?", [status,status,id])

  if(status==='APROVADA'){
    const [[p]]=await db.execute("SELECT p.*, c.nome as company_nome FROM proposals p JOIN companies c ON c.id=p.company_id WHERE p.id=?",[id]);
    let [items]=[[]];
    try{ [items]=await db.execute("SELECT pi.*, s.name as service_name FROM proposal_items pi JOIN services s ON s.id=pi.service_id WHERE pi.proposal_id=?", [id]); }catch(e){ console.warn('[WARN] proposal_items table missing? Falling back.'); }
    if (items && items.length){
      for(const it of items){
        const start = it.due_date ? `${it.due_date} 09:00:00` : new Date();
        await db.execute(
          `INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE','PROPOSTA',?)`,
          [`${it.service_name} — Proposta #${id}`, p.company_id, it.service_id, null, start, id]
        );
      }
    } else {
      const start = new Date();
      const title = (p.description?.trim() ? p.description : `Atividade gerada da Proposta #${id}`) + ` — Proposta #${id}`;
      await db.execute(
        `INSERT INTO activities (title, company_id, service_id, assigned_user_id, start_datetime, status, created_from, related_id) VALUES (?,?,?,?,?, 'PENDENTE','PROPOSTA',?)`,
        [title, p.company_id, null, null, start, id]
      );
    }
  }
  await db.end();
  return NextResponse.json({ ok:true })
}
