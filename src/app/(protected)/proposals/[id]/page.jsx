'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProposalDetail(){
  const { id } = useParams()
  const [p,setP]=useState(null)
  const [items,setItems]=useState([])
  const [services,setServices]=useState([])
  const [form,setForm]=useState({ service_id:'', qty:1, price:0, due_date:'' })
  const [loading,setLoading]=useState(true)

  async function load(){
    setLoading(true)
    const [pdata, it, sv] = await Promise.all([
      fetch(`/api/proposals/${id}`).then(r=>r.json()),
      fetch(`/api/proposals/${id}/items`).then(r=>r.json()),
      fetch(`/api/services`).then(r=>r.json())
    ])
    setP(pdata || {})
    setItems(it || [])
    setServices(sv || [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [id])

  async function add(e){
    e.preventDefault()
    await fetch(`/api/proposals/${id}/items`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    setForm({ service_id:'', qty:1, price:0, due_date:'' })
    await load()
  }

  async function patch(it,p){
    await fetch(`/api/proposals/${id}/items/${it.id}`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(p)
    })
    await load()
  }

  async function del(it){
    if(!confirm('Excluir item?')) return
    await fetch(`/api/proposals/${id}/items/${it.id}`,{ method:'DELETE' })
    await load()
  }

  if(loading) return <div>Carregando…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proposta #{p?.id}</h1>
        <div className="flex gap-2">
          {p?.order_id ? <Link className="sf-btn" href={`/orders/${p.order_id}`}>Pedido #{p.order_id}</Link> : null}
          <Link className="sf-btn" href="/proposals">Voltar</Link>
        </div>
      </div>

      <div className="sf-card">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><div className="hdr">Empresa</div><div>{p?.company_nome||p?.company_id}</div></div>
          <div><div className="hdr">Valor</div><div>R$ {Number(p?.value||0).toFixed(2)}</div></div>
          <div><div className="hdr">Status</div><div>{p?.status}</div></div>
        </div>
      </div>

      <div className="sf-card">
        <form onSubmit={add} className="grid sm:grid-cols-5 gap-2 items-end">
          <div>
            <label className="hdr">Serviço</label>
            <select className="sf-input" required value={form.service_id} onChange={e=>setForm({...form, service_id:e.target.value})}>
              <option value="">Selecione</option>
              {services.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="hdr">Qtd</label>
            <input type="number" min="1" className="sf-input" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} />
          </div>
          <div>
            <label className="hdr">Preço</label>
            <input type="number" step="0.01" className="sf-input" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
          </div>
          <div>
            <label className="hdr">Vencimento</label>
            <input type="date" className="sf-input" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />
          </div>
          <button className="sf-btn primary">Adicionar</button>
        </form>
      </div>

      <div className="sf-card overflow-auto">
        <table className="sf-table text-sm">
          <thead><tr><th>#</th><th>Serviço</th><th>Qtd</th><th>Preço</th><th>Total</th><th>Vencimento</th><th></th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>#{it.id}</td>
                <td>{it.service_name || it.service_id}</td>
                <td><input type="number" min="1" className="sf-input w-24" defaultValue={it.qty} onBlur={e=>patch(it,{ qty:e.target.value })} /></td>
                <td><input type="number" step="0.01" className="sf-input w-28" defaultValue={it.price} onBlur={e=>patch(it,{ price:e.target.value })} /></td>
                <td>R$ {(Number(it.qty)*Number(it.price)).toFixed(2)}</td>
                <td><input type="date" className="sf-input" defaultValue={it.due_date || ''} onBlur={e=>patch(it,{ due_date:e.target.value })} /></td>
                <td><button className="sf-btn danger" onClick={()=>del(it)}>Excluir</button></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="7" className="sf-muted">Sem itens</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
