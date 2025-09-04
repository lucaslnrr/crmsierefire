'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
export default function Contracts(){
  const [list,setList]=useState([]); const [companies,setCompanies]=useState([]); const [services,setServices]=useState([])
  const [form,setForm]=useState({company_id:'',start_date:'',end_date:'',monthly_value:'',notes:'',items:[{service_id:'',quantity_proposta:1}]})
  async function load(){ const [c,s,l]=await Promise.all([fetch('/api/companies').then(r=>r.json()),fetch('/api/services').then(r=>r.json()),fetch('/api/contracts').then(r=>r.json())]); setCompanies(c); setServices(s); setList(l) }
  useEffect(()=>{ load() },[])
  function addItem(){ setForm({...form,items:[...form.items,{service_id:'',quantity_proposta:1}]}) }
  function setItem(i,k,v){ const it=[...form.items]; it[i][k]=v; setForm({...form,items:it}) }
  async function onSubmit(e){ e.preventDefault(); await fetch('/api/contracts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setForm({company_id:'',start_date:'',end_date:'',monthly_value:'',notes:'',items:[{service_id:'',quantity_proposta:1}]}); load() }
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Contratos</h1>
    <div className="card"><form onSubmit={onSubmit} className="space-y-3">
      <div className="grid md:grid-cols-4 gap-3">
        <select className="select" value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} required><option value="">Empresa</option>{companies.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>
        <input className="input" type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required />
        <input className="input" type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} />
        <input className="input" placeholder="Valor mensal (R$)" value={form.monthly_value} onChange={e=>setForm({...form,monthly_value:e.target.value})} />
      </div>
      <textarea className="textarea" placeholder="Observações" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
      <div className="space-y-2"><div className="text-sm font-medium">Serviços</div>
        {form.items.map((it,i)=>(<div key={i} className="grid md:grid-cols-2 gap-2">
          <select className="select" value={it.service_id} onChange={e=>setItem(i,'service_id',e.target.value)} required><option value="">Serviço</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input className="input" type="number" min="1" value={it.quantity_proposta} onChange={e=>setItem(i,'quantity_proposta',e.target.value)} />
        </div>))}
        <button type="button" className="btn" onClick={addItem}>+ Serviço</button>
      </div>
      <div><button className="btn">Salvar Contrato</button></div>
    </form></div>
    <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>ID</th><th>Empresa</th><th>Início</th><th>Término</th><th>Valor Mensal</th><th>Status</th><th>Planner</th></tr></thead><tbody>{list.map(c=>(<tr key={c.id} className="border-t"><td>{c.id}</td><td>{c.company_nome}</td><td>{c.start_date}</td><td>{c.end_date||'—'}</td><td>{c.monthly_value?`R$ ${Number(c.monthly_value).toFixed(2)}`:'—'}</td><td>{c.status}</td><td><Link className="btn" href={`/contracts/${c.id}/planner`}>Abrir</Link></td></tr>))}</tbody></table></div>
  </div>)
}
