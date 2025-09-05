'use client'
import { useEffect, useMemo, useState } from 'react'
function addMonths(iso,n){ const d=new Date(iso); d.setMonth(d.getMonth()+n); return d.toISOString().slice(0,10) }
export default function Planner({ params }){
  const id=params.id; const [data,setData]=useState(null); const [saving,setSaving]=useState(false)
  async function load(){ const r=await fetch(`/api/contracts/${id}`); const j=await r.json(); setData(j) }
  async function plan(){ setSaving(true); await fetch(`/api/contracts/${id}/plan`,{method:'POST'}); setSaving(false); load() }
  useEffect(()=>{ load() },[id])
  if(!data) return <div>Carregando...</div>
  const months=[...Array(12)].map((_,i)=>i+1)
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Planner do Contrato #{data.contract.id} — {data.company?.nome}</h1>
    <div className="card"><button className="btn" disabled={saving} onClick={plan}>{saving?'Gerando...':'Gerar/Regerar atividades (12 meses)'}</button></div>
    <div className="card overflow-auto">
      <table className="table text-sm">
        <thead><tr><th>Item</th>{months.map(m=><th key={m}>M{m}</th>)}</tr></thead>
        <tbody>
          {data.items.map(it=>(<tr key={it.id}>
            <td>{it.service_name}</td>
            {months.map(m=>{ const cell=data.grid[it.id]?.[m]||{}; return <td key={m}>{cell.date ? `${cell.date} (${cell.days_to_action}d)` : '—'}</td>})}
          </tr>))}
        </tbody>
      </table>
    </div>
  </div>)
}
