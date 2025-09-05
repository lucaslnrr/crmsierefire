'use client'
import { useEffect, useState } from 'react'

export default function OrderDetail({ params }){
  const id = params.id
  const [order, setOrder] = useState(null)
  const [msg, setMsg] = useState('')
  const [item, setItem] = useState({ description:'', qty:1, unit_price:0 })

  async function load(){
    const r = await fetch(`/api/orders/${id}`)
    const j = await r.json()
    setOrder(j)
  }

  useEffect(()=>{ load() }, [id])

  async function saveHeader(){
    const body = {
      due_date: order._due ?? order.due_date_fmt ?? order.due_date ?? null,
      status: order._status ?? order.status ?? null,
      notes: order._notes ?? order.notes ?? null,
    }
    await fetch(`/api/orders/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    setMsg('Dados atualizados.')
    await load()
  }

  async function addItem(e){
    e.preventDefault()
    if(!item.description) return alert('Descrição obrigatória')
    await fetch(`/api/orders/${id}/items`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item) })
    setItem({ description:'', qty:1, unit_price:0 })
    await load()
  }

  async function delItem(itemId){
    if(!confirm('Remover item?')) return
    await fetch(`/api/orders/${id}/items/${itemId}`, { method:'DELETE' })
    await load()
  }

  async function removeOrder(){
    if(!confirm('Excluir este pedido?')) return
    await fetch(`/api/orders/${id}`, { method:'DELETE' })
    window.location.href = '/orders'
  }

  if(!order) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="sf-btn sf-btn--danger" onClick={removeOrder}>Excluir</button>
      </div>

      <div className="sf-card sf-grid sf-grid-3">
        <div><div className="hdr">Pedido</div><div>#{order.order_number}</div></div>
        <div><div className="hdr">Empresa</div><div>{order.company_nome}</div></div>
        <div><div className="hdr">Emissão</div><div>{order.issue_date_fmt || order.issue_date}</div></div>
        <div><div className="hdr">Total</div><div>R$ {Number(order.total_value||0).toFixed(2)}</div></div>
        <div>
          <label className="hdr">Vencimento</label>
          <input type="date" className="sf-input" defaultValue={order.due_date_fmt || order.due_date || ''} onChange={e=>order._due=e.target.value} />
        </div>
        <div>
          <label className="hdr">Status</label>
          <select className="sf-select" defaultValue={order.status||''} onChange={e=>order._status=e.target.value}>
            <option value="Aberto">Aberto</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Faturado">Faturado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div className="sf-grid" style={{gridTemplateColumns:'1fr'}}>
          <label className="hdr">Observações</label>
          <textarea className="sf-textarea" defaultValue={order.notes||''} onChange={e=>order._notes=e.target.value}></textarea>
        </div>
        <div><button className="sf-btn" onClick={saveHeader}>Salvar</button>{msg && <span className="sf-pill sf-pill--ok" style={{marginLeft:8}}>Salvo</span>}</div>
      </div>

      <div className="sf-card">
        <div className="sf-card-header">Itens</div>
        <div className="sf-card-body">
          <table className="sf-table text-sm">
            <thead><tr><th>Descrição</th><th>Qtd</th><th>Unitário</th><th>Total</th><th>Ações</th></tr></thead>
            <tbody>
              {(order.items||[]).map(it => (
                <tr key={it.id}>
                  <td>{it.description || '-'}</td>
                  <td>{Number(it.qty).toFixed(2)}</td>
                  <td>R$ {Number(it.unit_price).toFixed(2)}</td>
                  <td>R$ {Number(it.total).toFixed(2)}</td>
                  <td><button className="sf-btn sf-btn--danger" onClick={()=>delItem(it.id)}>Remover</button></td>
                </tr>
              ))}
              {!order.items?.length && <tr><td colSpan="5" className="sf-muted">Sem itens</td></tr>}
            </tbody>
          </table>

          <form onSubmit={addItem} className="sf-grid sf-grid-3" style={{marginTop:12}}>
            <div>
              <label className="hdr">Descrição</label>
              <input className="sf-input" value={item.description} onChange={e=>setItem(it=>({...it, description:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Qtd</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={item.qty}
                onChange={e=>setItem(it=>({...it, qty:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Unitário</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={item.unit_price}
                onChange={e=>setItem(it=>({...it, unit_price:e.target.value}))} />
            </div>
            <div><button className="sf-btn sf-btn--primary" type="submit">Adicionar item</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}