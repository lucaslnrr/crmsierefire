export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req,{params}){
  const id=Number(params.id); const b=await req.json()
  const allowed=['nome','cnpj','cpf','caepf','endereco','contato','telefone','email']
  const sets=[]; const args=[]
  for(const k of allowed){ if(k in b){ sets.push(`${k}=?`); args.push(b[k]||null) } }
  if(!sets.length) return NextResponse.json({ok:true})
  args.push(id)
  const db=await getDB(); await db.execute(`UPDATE companies SET ${sets.join(', ')} WHERE id=?`, args); await db.end()
  return NextResponse.json({ok:true})
}

export async function DELETE(req,{params}){
  const id=Number(params.id)
  const db=await getDB()
  await db.execute("UPDATE activities SET company_id=NULL WHERE company_id=?", [id])
  await db.execute("DELETE FROM companies WHERE id=?", [id])
  await db.end()
  return NextResponse.json({ok:true})
}
