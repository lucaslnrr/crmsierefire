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
