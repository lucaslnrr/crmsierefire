'use client'
import { useEffect, useMemo, useState } from 'react'

function weekDays(refDate){
  const d = new Date(refDate); const day = d.getDay();
  const mondayOffset = (day+6)%7;
  const mon = new Date(d); mon.setDate(d.getDate()-mondayOffset);
  return [...Array(6)].map((_,i)=>{ const x=new Date(mon); x.setDate(mon.getDate()+i); return x })
}

export default function CalendarPage(){
  const [users,setUsers]=useState([]); const [items,setItems]=useState([])
  const [prof,setProf]=useState(''); const [status,setStatus]=useState(''); const [doc,setDoc]=useState('')
  const [weekStart,setWeekStart]=useState(new Date()); const days=useMemo(()=>weekDays(weekStart),[weekStart])
  async function load(){ const qs=new URLSearchParams(); qs.set('start',days[0].toISOString().slice(0,10)); qs.set('end',days[5].toISOString().slice(0,10)); if(prof) qs.set('assigned_user_id',prof); if(status) qs.set('status',status); if(doc) qs.set('doc',doc); const [u,a]=await Promise.all([fetch('/api/users'), fetch('/api/activities?'+qs.toString())]); setUsers(await u.json()); setItems(await a.json()) }
  useEffect(()=>{ load() },[prof,status,doc,weekStart])
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Calendário (semana)</h1>
    <div className="card grid md:grid-cols-4 gap-3">
      <div><label className="hdr">Profissional</label><select className="select" value={prof} onChange={e=>setProf(e.target.value)}><option value="">Todos</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      <div><label className="hdr">Status</label><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos</option><option value="PENDENTE">Pendente</option><option value="EM_ATRASO">Em atraso</option><option value="CONCLUIDA">Concluída</option></select></div>
      <div><label className="hdr">CNPJ/CPF/CAEPF</label><input className="input" placeholder="Documento" value={doc} onChange={e=>setDoc(e.target.value)} /></div>
      <div className="flex items-end gap-2"><button className="btn" onClick={()=>setWeekStart(new Date(Date.now()-7*24*3600*1000))}>◀ Semana -1</button><button className="btn" onClick={()=>setWeekStart(new Date())}>Hoje</button><button className="btn" onClick={()=>setWeekStart(new Date(Date.now()+7*24*3600*1000))}>Semana +1 ▶</button></div>
    </div>
    <div className="cols-6">
      {days.map((d,i)=>{ const iso=d.toISOString().slice(0,10); const dayItems=items.filter(a=>String(a.start_datetime).slice(0,10)===iso); return (
        <div key={i} className="card">
          <div className="font-semibold">{d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'})}</div>
          <ul className="mt-2" style={{display:'flex',flexDirection:'column',gap:8}}>
            {dayItems.map(a=>(<li key={a.id} className="card" style={{padding:8,borderRadius:12}}>
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs" style={{color:'#6b7280'}}>{new Date(a.start_datetime).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} • {a.company_nome||'—'} • {a.profissional||'—'}</div>
              <a className="text-xs text-accent" href={`/activities/${a.id}`}>Registrar execução</a>
            </li>))}
            {dayItems.length===0 && <li className="text-xs" style={{color:'#9ca3af'}}>Sem atividades</li>}
          </ul>
        </div>
      )})}
    </div>
  </div>)
}
