'use client'
import { useEffect, useState } from 'react'
export default function Proposals(){
  const [list,setList]=useState([]); const [companies,setCompanies]=useState([]); const [services,setServices]=useState([])
  const [f,setF]=useState({company_id:'',description:'',value:0})
  useEffect(()=>{ (async()=>{ setCompanies(await (await fetch('/api/companies')).json()); setServices(await (await fetch('/api/services')).json()); load() })() },[])
  async function load(){ setList(await (await fetch('/api/proposals')).json()) }
  async function create(e){ e.preventDefault(); await fetch('/api/proposals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,value:Number(f.value||0)})}); setF({company_id:'',description:'',value:0}); load() }
  async function approve(id){ await fetch('/api/proposals/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'APROVADA'})}); load() }
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Propostas</h1>
    <form className="card grid md:grid-cols-4 gap-3" onSubmit={create}>
      <div><label className="hdr">Empresa</label><select className="select" value={f.company_id} onChange={e=>setF({...f,company_id:e.target.value})} required><option value="">Selecione</option>{companies.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
      <div className="md:col-span-2"><label className="hdr">Descrição</label><input className="input" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></div>
      <div><label className="hdr">Valor (R$)</label><input className="input" type="number" step="0.01" value={f.value} onChange={e=>setF({...f,value:e.target.value})}/></div>
      <div><button className="btn" type="submit">Criar</button></div>
    </form>
    <div className="card overflow-auto">
      <table className="table text-sm">
        <thead><tr><th>ID</th><th>Empresa</th><th>Valor</th><th>Status</th><th>Emitida</th><th className="text-right">Ações</th></tr></thead>
        <tbody>{list.map(p=>(
          <tr key={p.id}>
            <td>{p.id}</td><td>{p.company_nome}</td><td>R$ {Number(p.value).toFixed(2)}</td><td>{p.status}</td>
            <td>{new Date(p.issued_at).toLocaleString('pt-BR')}</td>
            <td style={{textAlign:'right'}}>
              {p.status!=='APROVADA' && <button className="btn" onClick={()=>approve(p.id)}>Aprovar</button>}
              <button className="btn" style={{marginLeft:8,opacity:.85}} onClick={async()=>{
                const value = prompt('Novo valor total (R$):', p.value)
                const description = prompt('Descrição:', p.description||'')
                if(value!=null || description!=null){
                  await fetch('/api/proposals/'+p.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ value: value??p.value, description: description??p.description })})
                  load()
                }
              }}>Editar</button>
              <button className="btn" style={{background:'#dc2626', marginLeft:8}} onClick={async()=>{
                if(confirm('Excluir proposta?')){
                  const r=await fetch('/api/proposals/'+p.id,{method:'DELETE'})
                  if(r.ok) load(); else alert('Não foi possível excluir (pode haver Pedido vinculado).')
                }
              }}>Excluir</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>)
}
