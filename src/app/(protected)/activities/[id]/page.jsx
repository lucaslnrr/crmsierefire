'use client'
import { useEffect, useState } from 'react'
export default function ActivityDetails({ params }){
  const id=params.id; const [data,setData]=useState(null); const [users,setUsers]=useState([])
  async function load(){ const r=await fetch(`/api/activities/${id}`); setData(await r.json()); setUsers(await (await fetch('/api/users')).json()) }
  useEffect(()=>{ load() },[id])
  if(!data) return <div>Carregando...</div>
  return (<div className="space-y-4">
    <div className="card"><div className="flex justify-end"><button className="btn danger" onClick={async()=>{ if(confirm('Excluir atividade?')){ await fetch(`/api/activities/${id}`,{method:'DELETE'}); window.location.href='/calendar' } }}>Excluir</button></div>
      <div className="grid md:grid-cols-3 gap-3">
        <div><div className="hdr">Título</div><div>{data.activity.title}</div></div>
        <div><div className="hdr">Empresa</div><div>{data.company?.nome||'—'}</div></div>
        <div><div className="hdr">Início</div><div>{new Date(data.activity.start_datetime).toLocaleString('pt-BR')}</div></div>
      </div>
    </div>
    <div className="card">
      <h2 className="font-semibold mb-2">Editar Atividade</h2>
      <div className="grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="Título" defaultValue={data.activity.title} onChange={e=>data.activity._title=e.target.value} />
        <select className="select" defaultValue={data.activity.assigned_user_id||''} onChange={e=>data.activity._assigned=e.target.value}>
          <option value="">(sem responsável)</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <input className="input" type="datetime-local" defaultValue={new Date(data.activity.start_datetime).toISOString().slice(0,16)} onChange={e=>data.activity._start=e.target.value} />
      </div>
      <div className="mt-2"><button className="btn" onClick={async()=>{
        const payload={}
        if(data.activity._title!=null) payload.title=data.activity._title
        if(data.activity._assigned!=null) payload.assigned_user_id=data.activity._assigned||null
        if(data.activity._start!=null) payload.start_datetime=data.activity._start.replace('T',' ')+':00'
        await fetch(`/api/activities/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        load()
      }}>Salvar Alterações</button></div>
    </div>
    <div className="card">
      <h2 className="font-semibold mb-2">Execuções</h2>
      <ul className="space-y-2">{(data.events||[]).map(ev=>(<li key={ev.id} className="card" style={{padding:8}}>
        <div className="text-sm"><b>{ev.event_type}</b> — {new Date(ev.event_time).toLocaleString('pt-BR')}</div>
        <div className="text-xs" style={{color:'#6b7280'}}>{ev.notes||''} • {ev.performed_by_name||'—'}</div>
      </li>))}{(!data.events||!data.events.length) && <li className="text-sm" style={{color:'#9ca3af'}}>Nenhum registro.</li>}</ul>
    </div>
  </div>)
}
