'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Orders(){
  const [list,setList] = useState([])
  const [companies,setCompanies] = useState([])
  const [creating,setCreating] = useState(false)
  const [form,setForm] = useState({ company_id:'', issue_date:'', due_date:'', notes:'' })

  async function load(){
    const [orders, comps] = await Promise.all([
      fetch('/api/orders').then(r=>r.json()),
      fetch('/api/companies').then(r=>r.json())
    ])
    setList(orders); setCompanies(comps)
  }
  useEffect(()=>{ load() }, [])

  async function createOrder(e){
    e.preventDefault()
    if(!form.company_id) return alert('Selecione a empresa')
    const r = await fetch('/api/orders',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        company_id: Number(form.company_id),
        issue_date: form.issue_date || undefined,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
        items: []
      })
    })
    const j = await r.json()
    if(!r.ok || !j.id){ alert(j.error || 'Falha ao criar') }
    else window.location.href = `/orders/${j.id}`
  }

  async function remove(id){
    if(!confirm('Excluir esse pedido?')) return
    await fetch('/api/orders/'+id, { method:'DELETE' })
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos de Venda</h1>
        <button className="sf-btn sf-btn--primary" onClick={()=>setCreating(true)}>Novo Pedido</button>
      </div>

      <div className="sf-card overflow-auto">
        <table className="sf-table text-sm">
          <thead>
            <tr>
              <th>#</th><th>Empresa</th><th>Emissão</th><th>Vencimento</th><th>Total</th><th>Status</th><th colSpan="2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map(o => (
              <tr key={o.id}>
                <td data-th="#">{o.order_number}</td>
                <td data-th="Empresa">{o.company_nome}</td>
                <td data-th="Emissão">{o.issue_date}</td>
                <td data-th="Vencimento">{o.due_date || '-'}</td>
                <td data-th="Total">R$ {Number(o.total_value||0).toFixed(2)}</td>
                <td data-th="Status">{o.status}</td>
                <td data-th="Ações"><Link className="sf-btn" href={`/orders/${o.id}`}>Abrir</Link></td>
                <td data-th=" "><button className="sf-btn sf-btn--danger" onClick={()=>remove(o.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="sf-card sf-shadow sf-rounded" style={{padding:16}}>
          <div className="sf-card-header">Novo Pedido</div>
          <div className="sf-card-body">
            <form onSubmit={createOrder} className="sf-grid sf-grid-3">
              <div>
                <label className="label hdr">Empresa</label>
                <select className="sf-select" value={form.company_id} onChange={e=>setForm(f=>({...f, company_id:e.target.value}))}>
                  <option value="">Selecione...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label hdr">Emissão</label>
                <input type="date" className="sf-input" value={form.issue_date} onChange={e=>setForm(f=>({...f, issue_date:e.target.value}))}/>
              </div>
              <div>
                <label className="label hdr">Vencimento</label>
                <input type="date" className="sf-input" value={form.due_date} onChange={e=>setForm(f=>({...f, due_date:e.target.value}))}/>
              </div>
              <div className="sf-grid" style={{gridTemplateColumns:'1fr'}}>
                <label className="label hdr">Observações</label>
                <textarea className="sf-textarea" value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))}></textarea>
              </div>
              <div>
                <button className="sf-btn sf-btn--primary" type="submit">Criar</button>
                <button type="button" className="sf-btn" onClick={()=>setCreating(false)} style={{marginLeft:8}}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}