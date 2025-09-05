'use client'
import { useEffect, useState } from 'react'
export default function OrderDetail({ params }){
  const id=params.id; const [order,setOrder]=useState(null); const [msg,setMsg]=useState('')
  async function load(){ const r=await fetch(`/api/orders/${id}`); setOrder(await r.json()) }
  useEffect(()=>{ load() },[id])
  if(!order) return <div>Carregando...</div>
  return (<div className="space-y-4">
    <div className="flex justify-end"><button className="btn danger" onClick={async()=>{ if(confirm('Excluir pedido?')){ await fetch(`/api/orders/${id}`,{method:'DELETE'}); window.location.href='/orders' } }}>Excluir</button></div>
    <div className="card grid md:grid-cols-4 gap-3">
      <div><div className="hdr">Pedido</div><div>#{order.order_number}</div></div>
      <div><div className="hdr">Empresa</div><div>{order.company_nome}</div></div>
      <div><div className="hdr">Emissão</div><div>{order.issue_date}</div></div>
      <div><div className="hdr">Total</div><div>R$ {Number(order.total_value||0).toFixed(2)}</div></div>
      <div className="md:col-span-4"><div className="hdr">Datas & Observações</div>
        <div className="grid md:grid-cols-3 gap-2">
          <div><label className="hdr">Vencimento</label><input className="input" type="date" defaultValue={order.due_date||''} onChange={e=>order._due=e.target.value} /></div>
          <div className="md:col-span-2"><label className="hdr">Observações</label><input className="input" defaultValue={order.notes||''} onChange={e=>order._notes=e.target.value} /></div>
        </div>
        <div className="mt-2"><button className="btn" onClick={async()=>{ const payload={}; if(order._due!=null) payload.due_date=order._due||null; if(order._notes!=null) payload.notes=order._notes||null; await fetch(`/api/orders/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); setMsg('Dados atualizados.'); load() }}>Salvar</button></div>
        {msg && <div style={{color:'#059669',marginTop:8}}>{msg}</div>}
      </div>
    </div>
  </div>)
}

// === Items Manager (inline) ===
function ItemsManager({ orderId }){
  const [items,setItems]=React.useState([])
  const [services,setServices]=React.useState([])
  const [form,setForm]=React.useState({ service_id:'', description:'', qty:1, unit_price:0 })

  async function load(){
    const [it, sv] = await Promise.all([
      fetch(`/api/orders/${orderId}/items`).then(r=>r.json()),
      fetch(`/api/services`).then(r=>r.json())
    ])
    setItems(it || [])
    setServices(sv || [])
  }
  React.useEffect(()=>{ load() }, [orderId])

  async function add(e){
    e.preventDefault()
    await fetch(`/api/orders/${orderId}/items`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    setForm({ service_id:'', description:'', qty:1, unit_price:0 })
    await load()
  }
  async function patch(it, p){
    await fetch(`/api/orders/${orderId}/items/${it.id}`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(p)
    })
    await load()
  }
  async function del(it){
    if(!confirm('Excluir item?')) return
    await fetch(`/api/orders/${orderId}/items/${it.id}`,{ method:'DELETE' })
    await load()
  }

  return (
    <div className="sf-card mt-4">
      <h2 className="text-lg font-semibold mb-2">Itens do Pedido</h2>
      <form onSubmit={add} className="grid sm:grid-cols-5 gap-2 items-end">
        <div>
          <label className="hdr">Serviço</label>
          <select className="sf-input" value={form.service_id} onChange={e=>setForm({...form, service_id:e.target.value})}>
            <option value="">Selecione</option>
            {services.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="hdr">Descrição</label>
          <input className="sf-input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </div>
        <div>
          <label className="hdr">Qtd</label>
          <input type="number" min="1" className="sf-input" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} />
        </div>
        <div>
          <label className="hdr">Preço</label>
          <input type="number" step="0.01" className="sf-input" value={form.unit_price} onChange={e=>setForm({...form, unit_price:e.target.value})} />
        </div>
        <button className="sf-btn primary">Adicionar</button>
      </form>

      <div className="overflow-auto mt-3">
        <table className="sf-table text-sm">
          <thead><tr><th>#</th><th>Serviço</th><th>Descrição</th><th>Qtd</th><th>Preço</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td>#{it.id}</td>
                <td>{it.service_name || it.service_id || '—'}</td>
                <td><input className="sf-input" defaultValue={it.description||''} onBlur={e=>patch(it,{ description: e.target.value })} /></td>
                <td><input type="number" min="1" className="sf-input w-24" defaultValue={it.qty} onBlur={e=>patch(it,{ qty:e.target.value })} /></td>
                <td><input type="number" step="0.01" className="sf-input w-28" defaultValue={it.unit_price} onBlur={e=>patch(it,{ unit_price:e.target.value })} /></td>
                <td>R$ {(Number(it.qty)*Number(it.unit_price)).toFixed(2)}</td>
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
