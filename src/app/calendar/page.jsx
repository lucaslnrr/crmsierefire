'use client'
import { useEffect, useMemo, useState } from 'react'

function weekDays(refDate){
  const d = new Date(refDate); const day = d.getDay();
  const monday = new Date(d); monday.setDate(d.getDate() - ((day+6)%7));
  return [...Array(7)].map((_,i)=>{ const x=new Date(monday); x.setDate(monday.getDate()+i); return x })
}
function monthGrid(refDate){
  const d = new Date(refDate); const year=d.getFullYear(); const month=d.getMonth();
  const first = new Date(year, month, 1)
  const start = new Date(first); const startDay = (start.getDay()+6)%7;
  start.setDate(start.getDate() - startDay)
  return [...Array(42)].map((_,i)=>{ const x=new Date(start); x.setDate(start.getDate()+i); return x })
}
function toDate(v){ return v instanceof Date ? v : new Date(v) }
function getISODate(v){ const d=toDate(v); if(!d||isNaN(d)) return ''; return d.toISOString().slice(0,10) }
function getTimeStr(v){ const d=toDate(v); if(!d||isNaN(d)) return ''; return d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) }
function fmtISO(date){ return getISODate(date) }
function csvEscape(v){ if(v==null) return ''; const s=String(v).replaceAll('"','""'); return /[",\n]/.test(s)? '"'+s+'"' : s }

export default function CalendarPage(){
  const [users,setUsers]=useState([]); const [items,setItems]=useState([])
  const [prof,setProf]=useState(''); const [status,setStatus]=useState(''); const [doc,setDoc]=useState('')
  const [mode,setMode]=useState('WEEK')
  const [refDate,setRefDate]=useState(new Date())

  const week = useMemo(()=>weekDays(refDate),[refDate])
  const grid = useMemo(()=>monthGrid(refDate),[refDate])
  const range = useMemo(()=>{
    if(mode==='WEEK'){ return { start: week[0], end: week[6] } }
    if(mode==='MONTH'){ return { start: grid[0], end: grid[41] } }
    const first = new Date(refDate.getFullYear(), refDate.getMonth(), 1)
    const last = new Date(refDate.getFullYear(), refDate.getMonth()+1, 0)
    return { start:first, end:last }
  },[mode, refDate, week, grid])

  async function load(){
    const qs=new URLSearchParams()
    qs.set('start', fmtISO(range.start)); qs.set('end', fmtISO(range.end));
    if(prof) qs.set('assigned_user_id',prof); if(status) qs.set('status',status); if(doc) qs.set('doc',doc);
    const [u,a]=await Promise.all([fetch('/api/users'), fetch('/api/activities?'+qs.toString())]);
    setUsers(await u.json()); setItems(await a.json())
  }
  useEffect(()=>{ load() },[prof,status,doc,mode,refDate])

  function prev(){ if(mode==='WEEK') setRefDate(new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()-7))
                   else setRefDate(new Date(refDate.getFullYear(), refDate.getMonth()-1, 1)) }
  function next(){ if(mode==='WEEK') setRefDate(new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()+7))
                   else setRefDate(new Date(refDate.getFullYear(), refDate.getMonth()+1, 1)) }
  function today(){ setRefDate(new Date()) }

  const byDay = useMemo(()=>{ const m = {}; for(const a of items){ const iso=getISODate(a.start_datetime); (m[iso]??=[]).push(a) } return m },[items])

  function exportCSV(){
    const headers = ['Data','Hora','Cliente','Profissional','Título','Status','Documento']
    const rows = items.map(a=>[
      getISODate(a.start_datetime),
      getTimeStr(a.start_datetime),
      a.company_nome||'',
      a.profissional||'',
      a.title||'',
      a.status||'',
      a.cnpj||a.cpf||a.caepf||''
    ])
    const csv = [headers, ...rows].map(r=>r.map(csvEscape).join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href=url; a.download=`atividades_${fmtISO(range.start)}_${fmtISO(range.end)}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Calendário</h1>

    <div className="card grid md:grid-cols-4 gap-3">
      <div><label className="hdr">Profissional</label><select className="select" value={prof} onChange={e=>setProf(e.target.value)}><option value="">Todos</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
      <div><label className="hdr">Status</label><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos</option><option value="PENDENTE">Pendente</option><option value="EM_ATRASO">Em atraso</option><option value="CONCLUIDA">Concluída</option></select></div>
      <div><label className="hdr">CNPJ/CPF/CAEPF</label><input className="input" placeholder="Documento" value={doc} onChange={e=>setDoc(e.target.value)} /></div>
      <div className="flex items-end gap-2">
        <button className={`btn ${mode==='WEEK'?'':'opacity-70'}`} onClick={()=>setMode('WEEK')}>Semana</button>
        <button className={`btn ${mode==='MONTH'?'':'opacity-70'}`} onClick={()=>setMode('MONTH')}>Mês</button>
        <button className={`btn ${mode==='LIST'?'':'opacity-70'}`} onClick={()=>setMode('LIST')}>Lista</button>
      </div>
      <div className="md:col-span-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn" onClick={prev}>◀</button>
          <button className="btn" onClick={today}>Hoje</button>
          <button className="btn" onClick={next}>▶</button>
          <input className="input ml-2" type="date" value={fmtISO(refDate)} onChange={e=>setRefDate(new Date(e.target.value+'T00:00:00'))} />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Período: {fmtISO(range.start)} → {fmtISO(range.end)}</div>
          <button className="btn" onClick={exportCSV}>Exportar CSV</button>
        </div>
      </div>
    </div>

    {mode==='WEEK' && (
      <div className="grid md:grid-cols-7 gap-3">
        {week.map((d,i)=>{ const iso=fmtISO(d); const dayItems=byDay[iso]||[]; return (
          <div key={i} className="card">
            <div className="font-semibold">{d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'})}</div>
            <ul className="mt-2 space-y-2">
              {dayItems.map(a=>(<li key={a.id} className="border rounded-xl p-2">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-gray-500">{getTimeStr(a.start_datetime)} • {a.company_nome||'—'} • {a.profissional||'—'}</div>
                <a className="text-xs text-accent" href={`/activities/${a.id}`}>Abrir</a>
              </li>))}
              {dayItems.length===0 && <li className="text-xs text-gray-400">Sem atividades</li>}
            </ul>
          </div>
        )})}
      </div>
    )}

    {mode==='MONTH' && (
      <div className="card">
        <div className="grid grid-cols-7 gap-2">
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((h,i)=>(<div key={i} className="hdr p-2 text-center">{h}</div>))}
          {grid.map((d,i)=>{ const iso=fmtISO(d); const dayItems=(byDay[iso]||[]).slice(0,4); const isOther = d.getMonth()!==refDate.getMonth(); return (
            <div key={i} className={`border rounded-xl p-2 min-h-[110px] ${isOther?'bg-gray-50 text-gray-400':''}`}>
              <div className="text-xs text-right">{d.getDate().toString().padStart(2,'0')}</div>
              <ul className="mt-1 space-y-1">
                {dayItems.map(a=>(<li key={a.id} className="text-xs">
                  <span className="font-medium">{getTimeStr(a.start_datetime)}</span> — <a className="underline" href={`/activities/${a.id}`}>{a.title}</a>
                </li>))}
                {(byDay[iso]||[]).length===0 && <li className="text-[11px] text-gray-400">Sem atividades</li>}
                {(byDay[iso]||[]).length>4 && <li className="text-[11px] text-blue-600">+ {(byDay[iso]||[]).length-4} mais</li>}
              </ul>
            </div>
          )})}
        </div>
      </div>
    )}

    {mode==='LIST' && (
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Data</th>
              <th className="p-2">Hora</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Profissional</th>
              <th className="p-2">Título</th>
              <th className="p-2">Status</th>
              <th className="p-2">Documento</th>
              <th className="p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {[...items].sort((a,b)=>toDate(a.start_datetime)-toDate(b.start_datetime)).map(a=>{
              const iso=fmtISO(a.start_datetime); const hr=getTimeStr(a.start_datetime)
              return (<tr key={a.id} className="border-t">
                <td className="p-2">{iso}</td>
                <td className="p-2">{hr}</td>
                <td className="p-2">{a.company_nome||'—'}</td>
                <td className="p-2">{a.profissional||'—'}</td>
                <td className="p-2">{a.title}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.cnpj||a.cpf||a.caepf||'—'}</td>
                <td className="p-2"><a className="text-accent underline" href={`/activities/${a.id}`}>Abrir</a></td>
              </tr>)
            })}
            {items.length===0 && <tr><td className="p-2 text-gray-500" colSpan={8}>Sem atividades no período.</td></tr>}
          </tbody>
        </table>
      </div>
    )}
  </div>)
}
