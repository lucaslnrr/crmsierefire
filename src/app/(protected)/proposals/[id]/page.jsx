'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProposalDetail({ params }){
  const id = params.id
  const [p, setP] = useState(null)
  const [services, setServices] = useState([])
  const [msg, setMsg] = useState('')
  const [item, setItem] = useState({ service_id:'', qty:1, price:0, due_date:'' })

  async function load(){
    const [pd, sv] = await Promise.all([
      fetch(`/api/proposals/${id}`).then(r=>r.json()),
      fetch('/api/services').then(r=>r.json())
    ])
    setP(pd); setServices(Array.isArray(sv)?sv:[])
  }
  useEffect(()=>{ load() }, [id])

  async function saveHeader(){
    const body = {
      description: p._desc ?? p.description ?? null,
      status: p._status ?? p.status ?? null
    }
    await fetch(`/api/proposals/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    setMsg('Salvo')
    await load()
  }

  async function addItem(e){
    e.preventDefault()
    if(!item.service_id) return alert('Selecione o serviço')
    await fetch(`/api/proposals/${id}/items`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      service_id: Number(item.service_id),
      qty: Number(item.qty||1),
      price: Number(item.price||0),
      due_date: item.due_date || null
    }) })
    setItem({ service_id:'', qty:1, price:0, due_date:'' })
    await load()
  }

  async function removeItem(itemId){
    if(!confirm('Remover item?')) return
    await fetch(`/api/proposals/${id}/items/${itemId}`, { method:'DELETE' })
    await load()
  }

  async function approve(){
    const r = await fetch('/api/proposals/'+id, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'APROVADA' })
    })
    const j = await r.json()
    if(j.order_id){ window.location.href = '/orders/'+j.order_id }
  }

  if(!p) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proposta #{p.id}</h1>
        <div className="flex gap-2">
          <button className="sf-btn" onClick={approve} disabled={p.status==='APROVADA'}>Aprovar</button>
          <Link className="sf-btn" href="/proposals">Voltar</Link>
        </div>
      </div>

      <div className="sf-card sf-grid sf-grid-3">
        <div><div className="hdr">Empresa</div><div>{p.company_nome}</div></div>
        <div><div className="hdr">Valor</div><div>R$ {Number(p.value||0).toFixed(2)}</div></div>
        <div>
          <label className="hdr">Status</label>
          <select className="sf-select" defaultValue={p.status||''} onChange={e=>p._status=e.target.value}>
            <option value="RASCUNHO">RASCUNHO</option>
            <option value="ENVIADA">ENVIADA</option>
            <option value="APROVADA">APROVADA</option>
            <option value="REJEITADA">REJEITADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>
        <div className="sf-grid" style={{gridTemplateColumns:'1fr'}}>
          <label className="hdr">Descrição</label>
          <textarea className="sf-textarea" defaultValue={p.description||''} onChange={e=>p._desc=e.target.value}></textarea>
        </div>
        <div><button className="sf-btn" onClick={saveHeader}>Salvar</button>{msg && <span className="sf-pill sf-pill--ok" style={{marginLeft:8}}>Salvo</span>}</div>
      </div>

      <div className="sf-card">
        <div className="sf-card-header">Itens da Proposta</div>
        <div className="sf-card-body">
          <table className="sf-table text-sm">
            <thead><tr><th>Serviço</th><th>Qtd</th><th>Preço</th><th>Vencimento</th><th>Total</th><th>Ações</th></tr></thead>
            <tbody>
              {(p.items||[]).map(it => (
                <tr key={it.id}>
                  <td>{it.service_name || it.service_id}</td>
                  <td>{Number(it.qty).toFixed(2)}</td>
                  <td>R$ {Number(it.price).toFixed(2)}</td>
                  <td>{it.due_date || '—'}</td>
                  <td>R$ {Number(it.qty*it.price).toFixed(2)}</td>
                  <td><button className="sf-btn sf-btn--danger" onClick={()=>removeItem(it.id)}>Remover</button></td>
                </tr>
              ))}
              {!p.items?.length && <tr><td colSpan="6" className="sf-muted">Sem itens</td></tr>}
            </tbody>
          </table>

          <form onSubmit={addItem} className="sf-grid sf-grid-3" style={{marginTop:12}}>
            <div>
              <label className="hdr">Serviço</label>
              <select className="sf-select" value={item.service_id} onChange={e=>setItem(s=>({...s, service_id:e.target.value}))}>
                <option value="">Selecione...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="hdr">Qtd</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={item.qty} onChange={e=>setItem(s=>({...s, qty:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Preço (R$)</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={item.price} onChange={e=>setItem(s=>({...s, price:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Vencimento</label>
              <input type="date" className="sf-input" value={item.due_date} onChange={e=>setItem(s=>({...s, due_date:e.target.value}))} />
            </div>
            <div><button className="sf-btn sf-btn--primary" type="submit">Adicionar item</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}