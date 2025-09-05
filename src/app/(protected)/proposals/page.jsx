'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Proposals(){
  const [list,setList] = useState([])
  const [companies,setCompanies] = useState([])
  const [f,setF] = useState({ company_id:'', description:'', value:'' })

  useEffect(()=>{
    async function boot(){
      try{
        const comps = await fetch('/api/companies').then(r=>r.json())
        setCompanies(Array.isArray(comps)?comps:[])
      }catch(e){ setCompanies([]) }
      await load()
    }
    boot()
  },[])

  async function load(){
    try{
      const rows = await fetch('/api/proposals').then(r=>r.json())
      setList(Array.isArray(rows)?rows:[])
    }catch(e){ setList([]) }
  }

  async function create(e){
    e.preventDefault()
    if(!f.company_id) return alert('Selecione a empresa')
    const body = {
      company_id: Number(f.company_id),
      description: f.description || null,
      value: Number(f.value || 0)
    }
    const r = await fetch('/api/proposals', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    if(!r.ok){ alert('Falha ao criar proposta'); return }
    setF({ company_id:'', description:'', value:'' })
    await load()
  }

  async function approve(id){
    const r = await fetch('/api/proposals/'+id, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'APROVADA' })
    })
    const j = await r.json()
    if(j.order_id){
      window.location.href = '/orders/' + j.order_id
    }else{
      load()
    }
  }

  async function remove(id){
    if(!confirm('Excluir esta proposta?')) return
    const r = await fetch('/api/proposals/'+id, { method:'DELETE' })
    if(!r.ok){
      const j = await r.json().catch(()=>({}))
      alert(j.error || 'Não foi possível excluir.')
      return
    }
    await load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Propostas</h1>

      <form className="sf-card sf-card-body sf-grid sf-grid-3" onSubmit={create}>
        <div>
          <label className="label hdr">Empresa</label>
          <select className="sf-select" value={f.company_id} onChange={e=>setF(s=>({...s, company_id:e.target.value}))}>
            <option value="">Selecione...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label hdr">Descrição</label>
          <input className="sf-input" value={f.description} onChange={e=>setF(s=>({...s, description:e.target.value}))} />
        </div>
        <div>
          <label className="label hdr">Valor (R$)</label>
          <input type="number" step="0.01" min="0" className="sf-input" value={f.value} onChange={e=>setF(s=>({...s, value:e.target.value}))} />
        </div>
        <div><button className="sf-btn sf-btn--primary" type="submit">Criar proposta</button></div>
      </form>

      <div className="sf-card overflow-auto">
        <table className="sf-table text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Empresa</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th className="hide-sm">Pedido</th>
              <th colSpan="2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td data-th="#">#{p.id}</td>
                <td data-th="Empresa">{p.company_nome || p.company_id}</td>
                <td data-th="Descrição">{p.description || '—'}</td>
                <td data-th="Valor">R$ {Number(p.value||0).toFixed(2)}</td>
                <td data-th="Status">{p.status}</td>
                <td data-th="Pedido" className="hide-sm">{p.order_id ? <Link className="sf-btn" href={`/orders/${p.order_id}`}>Pedido #{p.order_number || p.order_id}</Link> : '—'}</td>
                <td data-th="Ações">
                  <button className="sf-btn" onClick={()=>approve(p.id)} disabled={p.status==='APROVADA'}>Aprovar</button>
                </td>
                <td data-th=" ">
                  <button className="sf-btn sf-btn--danger" onClick={()=>remove(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={8} className="sf-muted">Sem propostas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}