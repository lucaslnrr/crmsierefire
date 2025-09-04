'use client'
import { useEffect, useState } from 'react'

export default function ActivityDetails({ params }){
  const id=params.id
  const [data,setData]=useState(null)
  const [users,setUsers]=useState([])
  const [form,setForm]=useState({ event_type:'EXECUTED', event_time:'', performed_by:'', notes:'', evidence_url:'', new_datetime:'' })
  const [msg,setMsg]=useState('')

  async function load(){
    const [aRes,uRes]=await Promise.all([fetch(`/api/activities/${id}`), fetch('/api/users')])
    const a = await aRes.json(); setData(a); setUsers(await uRes.json())
    setForm(f=>({ ...f, event_time: new Date().toISOString().slice(0,16) }))
  }
  useEffect(()=>{ load() },[id])

  async function onSubmit(e){
    e.preventDefault(); setMsg('')
    const payload={...form}
    payload.event_time = payload.event_time.replace('T',' ') + ':00'
    if (payload.new_datetime) payload.new_datetime = payload.new_datetime.replace('T',' ') + ':00'
    const r = await fetch(`/api/activities/${id}/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if(r.ok){ setMsg('Evento registrado.'); await load() } else setMsg('Falha ao salvar.')
  }

  if(!data) return <div>Carregando...</div>
  const lastExec = data.events.find(e=>e.event_type==='EXECUTED')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Atividade #{data.activity.id}</h1>
      <div className="card">
        <div className="grid md:grid-cols-3 gap-3">
          <div><div className="hdr">Título</div><div>{data.activity.title}</div></div>
          <div><div className="hdr">Cliente</div><div>{data.company?.nome||'—'}</div></div>
          <div><div className="hdr">Prevista</div><div>{new Date(data.activity.start_datetime).toLocaleString('pt-BR')}</div></div>
        </div>
        <div className="mt-2">
          {lastExec ? <span className="badge-ok">Executada em {new Date(lastExec.event_time).toLocaleString('pt-BR')}</span>
                    : <span className="badge-warn">Sem execução registrada</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Adicionar Evento</h2>
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="hdr">Tipo</label>
            <select className="select" value={form.event_type} onChange={e=>setForm({...form, event_type:e.target.value})}>
              <option value="EXECUTED">EXECUTED (conclui)</option>
              <option value="RESCHEDULED">RESCHEDULED (remarca)</option>
              <option value="CANCELED">CANCELED</option>
              <option value="NO_SHOW">NO_SHOW</option>
              <option value="NOTE">NOTE</option>
            </select>
          </div>
          <div>
            <label className="hdr">Data/Hora do evento</label>
            <input className="input" type="datetime-local" value={form.event_time} onChange={e=>setForm({...form, event_time:e.target.value})} />
          </div>
          {form.event_type==='RESCHEDULED' && (
            <div className="md:col-span-2">
              <label className="hdr">Nova data/hora (aplica na agenda)</label>
              <input className="input" type="datetime-local" value={form.new_datetime} onChange={e=>setForm({...form, new_datetime:e.target.value})} />
            </div>
          )}
          <div>
            <label className="hdr">Executado por</label>
            <select className="select" value={form.performed_by} onChange={e=>setForm({...form, performed_by:e.target.value})}>
              <option value="">—</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="hdr">Evidência (URL)</label>
            <input className="input" placeholder="https://..." value={form.evidence_url} onChange={e=>setForm({...form, evidence_url:e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="hdr">Observações</label>
            <textarea className="textarea" rows={4} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}></textarea>
          </div>
          <div className="md:col-span-2"><button className="btn">Salvar</button></div>
          {msg && <div className="text-sm text-green-700">{msg}</div>}
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Timeline</h2>
        {data.events.length===0 ? <div className="text-sm text-gray-500">Nenhum evento ainda.</div> :
          <ul className="space-y-2">
            {data.events.map(ev=>(
              <li key={ev.id} className="border rounded-xl p-2 text-sm">
                <div className="flex items-center justify-between">
                  <div><b>{ev.event_type}</b> • {new Date(ev.event_time).toLocaleString('pt-BR')}</div>
                  {ev.new_datetime && <span className="badge-info">Remarcado p/ {new Date(ev.new_datetime).toLocaleString('pt-BR')}</span>}
                </div>
                <div className="text-gray-600">Por: {ev.performed_by_name || '—'}</div>
                {ev.notes && <div className="text-gray-700">Obs.: {ev.notes}</div>}
                {ev.evidence_url && <a className="text-blue-600 underline" href={ev.evidence_url} target="_blank">Evidência</a>}
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  )
}
