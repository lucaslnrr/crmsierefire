'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
export default function Contracts(){
  const [list,setList]=useState([]); const [companies,setCompanies]=useState([]); const [services,setServices]=useState([])
  const [f,setF]=useState({company_id:'',start_date:'',end_date:'',monthly_value:0,status:'ATIVO'})
  useEffect(()=>{ (async()=>{ setCompanies(await (await fetch('/api/companies')).json()); setServices(await (await fetch('/api/services')).json()); load() })() },[])
  async function load(){ setList(await (await fetch('/api/contracts')).json()) }
  async function create(e){ e.preventDefault(); await fetch('/api/contracts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,monthly_value:Number(f.monthly_value||0)})}); setF({company_id:'',start_date:'',end_date:'',monthly_value:0,status:'ATIVO'}); load() }
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Contratos</h1>
    <form className="card grid md:grid-cols-5 gap-3" onSubmit={create}>
      <div><label className="hdr">Empresa</label><select className="select" value={f.company_id} onChange={e=>setF({...f,company_id:e.target.value})} required><option value="">Selecione</option>{companies.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
      <div><label className="hdr">Início</label><input type="date" className="input" value={f.start_date} onChange={e=>setF({...f,start_date:e.target.value})} required/></div>
      <div><label className="hdr">Término</label><input type="date" className="input" value={f.end_date} onChange={e=>setF({...f,end_date:e.target.value})}/></div>
      <div><label className="hdr">Valor mensal</label><input className="input" type="number" step="0.01" value={f.monthly_value} onChange={e=>setF({...f,monthly_value:e.target.value})}/></div>
      <div><button className="btn" type="submit">Criar</button></div>
    </form>
    <div className="card overflow-auto">
      <table className="table text-sm">
        <thead><tr><th>ID</th><th>Empresa</th><th>Início</th><th>Término</th><th>Valor Mensal</th><th>Status</th><th>Planner</th><th className="text-right">Ações</th></tr></thead>
        <tbody>{list.map(c=>(<tr key={c.id}>
          <td>{c.id}</td><td>{c.company_nome}</td><td>{c.start_date?.slice(0,10)||''}</td><td>{c.end_date?.slice(0,10)||''}</td><td>R$ {Number(c.monthly_value||0).toFixed(2)}</td><td>{c.status}</td>
          <td><Link href={`/contracts/${c.id}/planner`}>Abrir</Link></td>
          <td style={{textAlign:'right'}}><button className="btn" style={{background:'#dc2626'}} onClick={async()=>{ if(confirm('Excluir contrato? Isso também removerá atividades do planner.')){ await fetch('/api/contracts/'+c.id,{method:'DELETE'}); load() } }}>Excluir</button></td>
        </tr>))}</tbody>
      </table>
    </div>
  </div>)
}
