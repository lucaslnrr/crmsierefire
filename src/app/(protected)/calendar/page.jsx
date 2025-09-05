'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

function fmtDate(d){ return d.toISOString().slice(0,10) }
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x }
function startOfWeek(d){
  const x=new Date(d); const dow=x.getDay(); const monday=(dow+6)%7; x.setDate(x.getDate()-monday); x.setHours(0,0,0,0); return x
}
function startOfMonth(d){ const x=new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
function endOfMonth(d){ const x=new Date(d); x.setMonth(x.getMonth()+1,0); x.setHours(23,59,59,999); return x }
function rangeDays(from, to){
  const out=[]; let x=new Date(from); while(x<=to){ out.push(new Date(x)); x.setDate(x.getDate()+1) } return out
}
function groupByDay(items){
  const map = new Map()
  for(const it of items){
    const d = new Date(it.start_datetime)
    const key = d.toISOString().slice(0,10)
    if(!map.has(key)) map.set(key, [])
    map.get(key).push(it)
  }
  return map
}

export default function CalendarPage(){
  const [view, setView] = useState('week')   // 'day' | 'week' | 'month'
  const [mode, setMode] = useState('cards')  // 'cards' | 'list'
  const [anchor, setAnchor] = useState(new Date())
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // fetch window by view
  const { from, to, days } = useMemo(()=>{
    if(view==='day'){
      const s = startOfDay(anchor); const e = endOfDay(anchor)
      return { from:s, to:e, days: [s] }
    }
    if(view==='week'){
      const s = startOfWeek(anchor); const e = endOfDay(addDays(s,6))
      return { from:s, to:e, days: rangeDays(s,e) }
    }
    const s = startOfMonth(anchor); const e = endOfMonth(anchor)
    return { from:s, to:e, days: rangeDays(s,e) }
  }, [view, anchor])

  async function load(){
    setLoading(true)
    const qs = new URLSearchParams({ start: fmtDate(from), end: fmtDate(to) })
    const res = await fetch('/api/activities?'+qs.toString())
    const data = await res.json()
    setItems(Array.isArray(data)?data:[])
    setLoading(false)
  }

  useEffect(()=>{ load() }, [view, anchor])

  function prev(){
    if(view==='day') setAnchor(addDays(anchor,-1))
    else if(view==='week') setAnchor(addDays(anchor,-7))
    else { const x=new Date(anchor); x.setMonth(x.getMonth()-1); setAnchor(x) }
  }
  function next(){
    if(view==='day') setAnchor(addDays(anchor,1))
    else if(view==='week') setAnchor(addDays(anchor,7))
    else { const x=new Date(anchor); x.setMonth(x.getMonth()+1); setAnchor(x) }
  }
  function today(){ setAnchor(new Date()) }

  const grouped = useMemo(()=>groupByDay(items), [items])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="sf-card sf-card-body" style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="sf-btn" onClick={prev}>◀</button>
          <button className="sf-btn" onClick={today}>Hoje</button>
          <button className="sf-btn" onClick={next}>▶</button>
          <div className="sf-pill">{anchor.toLocaleDateString('pt-BR', view==='month'?{month:'long',year:'numeric'}:{day:'2-digit',month:'2-digit',year:'numeric'})}</div>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div className="sf-pill" role="tablist" aria-label="View">
            {['day','week','month'].map(v=>(
              <button key={v} className={"sf-btn"+(view===v?' sf-btn--accent':'')} onClick={()=>setView(v)}>
                {v==='day'?'Dia':v==='week'?'Semana':'Mês'}
              </button>
            ))}
          </div>
          <div className="sf-pill" role="tablist" aria-label="Mode">
            {['cards','list'].map(m=>(
              <button key={m} className={"sf-btn"+(mode===m?' sf-btn--primary':'')} onClick={()=>setMode(m)}>
                {m==='cards'?'Cards':'Lista'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="sf-card sf-card-body">Carregando…</div>}

      {!loading && mode==='list' && (
        <div className="sf-card overflow-auto">
          <table className="sf-table text-sm">
            <thead>
              <tr>
                <th>Data</th><th>Hora</th><th>Título</th><th>Empresa</th><th>Profissional</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(ev=>{
                const d = new Date(ev.start_datetime)
                const dateStr = d.toLocaleDateString('pt-BR')
                const timeStr = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
                return (
                  <tr key={ev.id}>
                    <td data-th="Data">{dateStr}</td>
                    <td data-th="Hora">{timeStr}</td>
                    <td data-th="Título">{ev.title||ev.tipo||'Atividade'}</td>
                    <td data-th="Empresa">{ev.company_nome||'—'}</td>
                    <td data-th="Profissional">{ev.profissional||'—'}</td>
                    <td data-th="Status">{ev.status||'—'}</td>
                    <td data-th="Ações"><Link className="sf-btn" href={`/activities/${ev.id}`}>Abrir</Link></td>
                  </tr>
                )
              })}
              {!items.length && <tr><td colSpan={7} className="sf-muted">Sem atividades</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && mode==='cards' && (
        <div className={view==='month' ? 'sf-grid sf-grid-3' : 'sf-grid sf-grid-3'}>
          {days.map((d,i)=>{
            const key = d.toISOString().slice(0,10)
            const dayItems = (grouped.get(key)||[]).sort((a,b)=>new Date(a.start_datetime)-new Date(b.start_datetime))
            return (
              <div key={key} className="sf-card sf-card-body">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {d.toLocaleDateString('pt-BR', { weekday: view==='month'?'short':'long', day:'2-digit', month:'2-digit' })}
                  </div>
                  <div className="sf-pill">{dayItems.length} item{dayItems.length===1?'':'s'}</div>
                </div>
                <ul className="mt-3" style={{display:'flex',flexDirection:'column',gap:8}}>
                  {dayItems.map(ev=>{
                    const td = new Date(ev.start_datetime)
                    const timeStr = td.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
                    return (
                      <li key={ev.id} className="sf-card sf-card-body">
                        <div className="text-sm font-bold">{timeStr} • {ev.title||ev.tipo||'Atividade'}</div>
                        <div className="sf-muted text-xs" style={{marginTop:4}}>
                          {ev.company_nome||'—'} • {ev.profissional||'—'} • {ev.status||'—'}
                        </div>
                        <div style={{marginTop:8}}>
                          <Link className="sf-btn" href={`/activities/${ev.id}`}>Abrir</Link>
                        </div>
                      </li>
                    )
                  })}
                  {dayItems.length===0 && <li className="sf-muted text-xs">Sem atividades</li>}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}