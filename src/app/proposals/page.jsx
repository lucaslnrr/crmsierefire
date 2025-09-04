'use client'
import { useEffect, useState } from 'react'
export default function Proposals(){
  const [companies,setCompanies]=useState([]); const [services,setServices]=useState([]); const [list,setList]=useState([])
  const [form,setForm]=useState({company_id:'',description:'',value:'',items:[{service_id:'',qty:1,price:'',due_date:''}]})
  async function load(){ const [c,s,p]=await Promise.all([fetch('/api/companies').then(r=>r.json()),fetch('/api/services').then(r=>r.json()),fetch('/api/proposals').then(r=>r.json())]); setCompanies(c); setServices(s); setList(p) }
  useEffect(()=>{ load() },[])
  function addItem(){ setForm({...form,items:[...form.items,{service_id:'',qty:1,price:'',due_date:''}]}) }
  function setItem(i,k,v){ const items=[...form.items]; items[i][k]=v; setForm({...form,items}) }
  async function onSubmit(e){ e.preventDefault(); await fetch('/api/proposals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setForm({company_id:'',description:'',value:'',items:[{service_id:'',qty:1,price:'',due_date:''}]}); load() }
  async function approve(id){ await fetch('/api/proposals/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'APROVADA'})}); load() }
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Propostas</h1>
    <div className="card"><form onSubmit={onSubmit} className="space-y-3">
      <div className="grid md:grid-cols-3 gap-3">
        <select className="select" value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} required><option value="">Empresa</option>{companies.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>
        <input className="input" placeholder="Valor total (R$)" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} />
        <input className="input" placeholder="Descrição" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      </div>
      <div className="space-y-2"><div className="text-sm font-medium">Itens</div>
        {form.items.map((it,i)=>(<div key={i} className="grid md:grid-cols-4 gap-2">
          <select className="select" value={it.service_id} onChange={e=>setItem(i,'service_id',e.target.value)} required><option value="">Serviço</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <input className="input" type="number" min="1" value={it.qty} onChange={e=>setItem(i,'qty',e.target.value)} />
          <input className="input" placeholder="Preço (R$)" value={it.price} onChange={e=>setItem(i,'price',e.target.value)} />
          <input className="input" type="date" value={it.due_date||''} onChange={e=>setItem(i,'due_date',e.target.value)} />
        </div>))}
        <button type="button" className="btn" onClick={addItem}>+ Item</button>
      </div>
      <div><button className="btn">Salvar Proposta</button></div>
    </form></div>
    <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>ID</th><th>Empresa</th><th>Valor</th><th>Status</th><th>Emitida</th><th>Ações</th></tr></thead><tbody>{list.map(p=>(<tr key={p.id} className="border-t"><td>{p.id}</td><td>{p.company_nome}</td><td>R$ {Number(p.value).toFixed(2)}</td><td>{p.status}</td><td>{new Date(p.issued_at).toLocaleString('pt-BR')}</td><td>{p.status!=='APROVADA' && <button className="btn" onClick={()=>approve(p.id)}>Aprovar</button>}</td></tr>))}</tbody></table></div>
  </div>)
}
