'use client'
import { useEffect, useMemo, useState } from 'react'
function addMonths(iso,n){ const d=new Date(iso); d.setMonth(d.getMonth()+n); return d.toISOString().slice(0,10) }
export default function Planner({ params }){
  const id=params.id; const [data,setData]=useState(null); const [saving,setSaving]=useState(false)
  async function load(){ const r=await fetch(`/api/contracts/${id}`); setData(await r.json()) }
  useEffect(()=>{ load() },[id])
  const months=useMemo(()=>{ if(!data) return []; const s=data.contract.start_date; return [...Array(12)].map((_,i)=>({idx:i+1,label:new Date(addMonths(s,i)).toLocaleDateString('pt-BR',{month:'short'})}))},[data])
  async function saveCell(itemId, idx, date){ setSaving(true); await fetch(`/api/contracts/${id}/plan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item_id:itemId,month_index:idx,date})}); await load(); setSaving(false) }
  if(!data) return <div>Carregando...</div>
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Planner do Contrato #{data.contract.id}</h1>
    <div className="card"><div className="grid md:grid-cols-4 gap-3">
      <div><div className="hdr">Cliente</div><div>{data.company.nome}</div></div>
      <div><div className="hdr">Início</div><div>{data.contract.start_date}</div></div>
      <div><div className="hdr">Término</div><div>{data.contract.end_date||'—'}</div></div>
      <div><div className="hdr">Valor mensal</div><div>{data.contract.monthly_value?`R$ ${Number(data.contract.monthly_value).toFixed(2)}`:'—'}</div></div>
    </div></div>
    <div className="card overflow-auto">
      <div className="grid" style={{gridTemplateColumns:`220px 220px 180px repeat(${months.length}, 180px)`}}>
        <div className="hdr p-2">ITEM</div><div className="hdr p-2">SERVIÇOS CONTRATADOS</div><div className="hdr p-2">QUANTIDADE PROPOSTA</div>
        {months.map(m=>(<div key={m.idx} className="hdr p-2 text-center">{m.label.toUpperCase()}<div className="text-[10px] text-gray-400">PREVISÃO / DIAS</div></div>))}
        {data.items.map(it=>(<>
          <div className="border rounded-xl p-2">{it.item_index}</div>
          <div className="border rounded-xl p-2">{it.service_name}</div>
          <div className="border rounded-xl p-2">{it.quantity_proposta}</div>
          {months.map(m=>{ const cell=(data.grid[it.id]&&data.grid[it.id][m.idx])||null; const valueISO=cell?.date||''; const days=cell?.days_to_action??null; const overdue=typeof days==='number' && days<0; return (
            <div key={m.idx} className="border rounded-xl p-2">
              <input className="date" type="date" value={valueISO} onChange={e=>saveCell(it.id,m.idx,e.target.value)} />
              <div className={`text-xs mt-1 ${overdue?'text-red-600':'text-gray-500'}`}>{valueISO?`${days} dia(s)`:'Sem Atividade Lançada'}</div>
            </div>
          )})}
        </>))}
      </div>
      {saving && <div className="text-sm text-gray-500 mt-2">Salvando...</div>}
    </div>
  </div>)
}
