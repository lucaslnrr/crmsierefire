'use client'
import { useEffect, useState } from 'react'
export default function Orders(){
  const [list,setList]=useState([])
  async function load(){ setList(await (await fetch('/api/orders')).json()) }
  useEffect(()=>{ load() },[])
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Pedidos de Venda</h1>
    <div className="card overflow-auto">
      <table className="table text-sm">
        <thead><tr><th>#</th><th>Empresa</th><th>Emissão</th><th>Vencimento</th><th>Valor</th><th>Status</th><th colSpan="2">Ações</th></tr></thead>
        <tbody>{list.map(o=>(<tr key={o.id}>
          <td>{o.order_number}</td><td>{o.company_nome}</td><td>{o.issue_date}</td><td>{o.due_date||'—'}</td><td>R$ {Number(o.total_value||0).toFixed(2)}</td><td>{o.status}</td>
          <td><a className="text-accent" href={`/orders/${o.id}`}>Abrir</a></td>
          <td><button className="btn" style={{background:'#dc2626'}} onClick={async()=>{ if(confirm('Excluir pedido?')){ await fetch('/api/orders/'+o.id,{method:'DELETE'}); load() } }}>Excluir</button></td>
        </tr>))}</tbody>
      </table>
    </div>
  </div>)
}
