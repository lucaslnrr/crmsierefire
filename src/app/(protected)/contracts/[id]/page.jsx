'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ContractDetail(){
  const params = useParams()
  const id = params.id
  const [c,setC] = useState(null)
  const [items,setItems] = useState([])
  const [services,setServices] = useState([])
  const [form,setForm] = useState({ service_id:'', quantity_proposta:1 })
  const [loading,setLoading]=useState(true)

  async function load(){
    setLoading(true)
    const [cdata, itemsData, servicesData] = await Promise.all([
      fetch(`/api/contracts/${id}`).then(r=>r.json()),
      fetch(`/api/contracts/${id}/items`).then(r=>r.json()),
      fetch(`/api/services`).then(r=>r.json())
    ])
    setC(cdata)
    setItems(itemsData || [])
    setServices(servicesData || [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [id])

  async function addItem(e){
    e.preventDefault()
    await fetch(`/api/contracts/${id}/items`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    setForm({ service_id:'', quantity_proposta:1 })
    await load()
  }

  async function updateItem(it, patch){
    await fetch(`/api/contracts/${id}/items/${it.id}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(patch)
    })
    await load()
  }

  async function removeItem(it){
    if(!confirm('Remover item?')) return
    await fetch(`/api/contracts/${id}/items/${it.id}`,{ method:'DELETE' })
    await load()
  }

  if(loading) return <div>Carregando…</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Contrato #{c?.id}</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sf-card">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="hdr">Empresa</div><div>{c?.company_nome||c?.company_id}</div></div>
            <div><div className="hdr">Status</div><div>{c?.status}</div></div>
            <div><div className="hdr">Início</div><div>{c?.start_date}</div></div>
            <div><div className="hdr">Término</div><div>{c?.end_date||'—'}</div></div>
            <div className="col-span-2"><div className="hdr">Observações</div><div>{c?.notes||'—'}</div></div>
          </div>
        </div>
        <div className="sf-card">
          <form onSubmit={addItem} className="grid sm:grid-cols-3 gap-2 items-end">
            <div>
              <label className="hdr">Serviço</label>
              <select className="sf-input" value={form.service_id} onChange={e=>setForm({...form, service_id:e.target.value})} required>
                <option value="">Selecione</option>
                {services.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="hdr">Quantidade</label>
              <input type="number" min="1" className="sf-input" value={form.quantity_proposta} onChange={e=>setForm({...form, quantity_proposta:e.target.value})} />
            </div>
            <button className="sf-btn primary">Adicionar</button>
          </form>
        </div>
      </div>

      <div className="sf-card overflow-auto">
        <table className="sf-table text-sm">
          <thead><tr><th>#</th><th>Serviço</th><th>Quantidade</th><th>Ações</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id}>
                <td data-th="#">#{it.id}</td>
                <td data-th="Serviço">{it.service_name || it.service_id}</td>
                <td data-th="Quantidade">
                  <input type="number" min="1" className="sf-input w-24" defaultValue={it.quantity_proposta} onBlur={e=>updateItem(it,{ quantity_proposta: e.target.value })} />
                </td>
                <td data-th="Ações">
                  <div className="flex gap-2">
                    <button className="sf-btn" onClick={()=>updateItem(it,{ service_id: it.service_id })}>Salvar</button>
                    <button className="sf-btn danger" onClick={()=>removeItem(it)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="4" className="sf-muted">Sem itens</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
