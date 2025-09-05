'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Proposals(){
  const [list,setList] = useState([])
  const [companies,setCompanies] = useState([])
  const [services,setServices] = useState([])
  const [f,setF] = useState({ company_id:'', description:'', value:'' })
  const [items, setItems] = useState([])
  const [it, setIt] = useState({ service_id:'', qty:1, price:0, due_date:'' })

  useEffect(()=>{
    async function boot(){
      try{
        const [comps, svs] = await Promise.all([
          fetch('/api/companies').then(r=>r.json()),
          fetch('/api/services').then(r=>r.json())
        ])
        setCompanies(Array.isArray(comps)?comps:[])
        setServices(Array.isArray(svs)?svs:[])
      }catch(e){ setCompanies([]); setServices([]) }
      await load()
    }
    boot()
  },[])

  async function load(){
    try{
      const rows = await fetch('/api/proposals').then(r=>r.json())
      setList(Array.isArray(rows)?rows:[])
    }catch(e){ setList([]) }
  }

  function addItem(e){
    e.preventDefault()
    if(!it.service_id) return alert('Selecione o serviço')
    setItems(arr => [...arr, { ...it, service_id:Number(it.service_id), qty:Number(it.qty||1), price:Number(it.price||0) }])
    setIt({ service_id:'', qty:1, price:0, due_date:'' })
  }
  function removeLocal(idx){
    setItems(arr => arr.filter((_,i)=>i!==idx))
  }
  const total = items.reduce((s,a)=>s + Number(a.qty||1)*Number(a.price||0), 0)

  async function create(e){
    e.preventDefault()
    if(!f.company_id) return alert('Selecione a empresa')
    const body = {
      company_id: Number(f.company_id),
      description: f.description || null,
      items
    }
    const r = await fetch('/api/proposals', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    })
    if(!r.ok){ alert('Falha ao criar proposta'); return }
    setF({ company_id:'', description:'', value:'' })
    setItems([])
    await load()
  }

  async function approve(id){
    const r = await fetch('/api/proposals/'+id, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'APROVADA' })
    })
    const j = await r.json()
    if(j.order_id){
      window.location.href = '/orders/' + j.order_id
    }else{
      load()
    }
  }

  async function remove(id){
    if(!confirm('Excluir esta proposta?')) return
    const r = await fetch('/api/proposals/'+id, { method:'DELETE' })
    if(!r.ok){
      const j = await r.json().catch(()=>({}))
      alert(j.error || 'Não foi possível excluir.')
      return
    }
    await load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Propostas</h1>

      <form className="sf-card sf-card-body" onSubmit={create}>
        <div className="sf-grid sf-grid-3">
          <div>
            <label className="label hdr">Empresa</label>
            <select className="sf-select" value={f.company_id} onChange={e=>setF(s=>({...s, company_id:e.target.value}))}>
              <option value="">Selecione...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="sf-grid" style={{gridTemplateColumns:'1fr'}}>
            <label className="label hdr">Descrição</label>
            <input className="sf-input" value={f.description} onChange={e=>setF(s=>({...s, description:e.target.value}))} />
          </div>
        </div>

        <div className="sf-card sf-card-body" style={{marginTop:12}}>
          <div className="sf-card-header">Itens da Proposta</div>
          <div className="sf-grid sf-grid-3" style={{marginTop:8}}>
            <div>
              <label className="hdr">Serviço</label>
              <select className="sf-select" value={it.service_id} onChange={e=>setIt(s=>({...s, service_id:e.target.value}))}>
                <option value="">Selecione...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="hdr">Qtd</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={it.qty} onChange={e=>setIt(s=>({...s, qty:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Preço (R$)</label>
              <input type="number" step="0.01" min="0" className="sf-input" value={it.price} onChange={e=>setIt(s=>({...s, price:e.target.value}))} />
            </div>
            <div>
              <label className="hdr">Vencimento</label>
              <input type="date" className="sf-input" value={it.due_date} onChange={e=>setIt(s=>({...s, due_date:e.target.value}))} />
            </div>
            <div style={{alignSelf:'end'}}>
              <button className="sf-btn sf-btn--primary" onClick={addItem}>Adicionar item</button>
            </div>
          </div>

          <div className="overflow-auto" style={{marginTop:8}}>
            <table className="sf-table text-sm">
              <thead><tr><th>Serviço</th><th>Qtd</th><th>Preço</th><th>Vencimento</th><th>Total</th><th>Ações</th></tr></thead>
              <tbody>
                {items.map((row,idx)=>{
                  const svc = services.find(s=>s.id===row.service_id)
                  return (
                    <tr key={idx}>
                      <td data-th="Serviço">{svc?svc.name:row.service_id}</td>
                      <td data-th="Qtd">{Number(row.qty).toFixed(2)}</td>
                      <td data-th="Preço">R$ {Number(row.price).toFixed(2)}</td>
                      <td data-th="Vencimento">{row.due_date || '—'}</td>
                      <td data-th="Total">R$ {(Number(row.qty)*Number(row.price)).toFixed(2)}</td>
                      <td data-th="Ações"><button type="button" className="sf-btn sf-btn--danger" onClick={()=>removeLocal(idx)}>Remover</button></td>
                    </tr>
                  )
                })}
                {!items.length && <tr><td colSpan={6} className="sf-muted">Sem itens</td></tr>}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} className="text-right font-bold">Total</td><td colSpan={2}>R$ {total.toFixed(2)}</td></tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div style={{marginTop:12}}><button className="sf-btn sf-btn--primary" type="submit">Criar proposta</button></div>
      </form>

      <div className="sf-card overflow-auto">
        <table className="sf-table text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Empresa</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th className="hide-sm">Pedido</th><th className="hide-sm">Contrato</th>
              <th colSpan="3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td data-th="#">#{p.id}</td>
                <td data-th="Empresa">{p.company_nome || p.company_id}</td>
                <td data-th="Descrição">{p.description || '—'}</td>
                <td data-th="Valor">R$ {Number(p.value||0).toFixed(2)}</td>
                <td data-th="Status">{p.status}</td>
                <td data-th="Pedido" className="hide-sm">{p.order_id ? <Link className="sf-btn" href={`/orders/${p.order_id}`}>Pedido #{p.order_number || p.order_id}</Link> : '—'}</td>
                <td data-th="Ações"><Link className="sf-btn" href={`/proposals/${p.id}`}>Abrir</Link></td>
                <td data-th=" "><button className="sf-btn" onClick={()=>approve(p.id)} disabled={p.status==='APROVADA'}>Aprovar</button></td>
                <td data-th=" "><button className="sf-btn sf-btn--danger" onClick={()=>remove(p.id)}>Excluir</button></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={9} className="sf-muted">Sem propostas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}