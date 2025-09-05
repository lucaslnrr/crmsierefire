'use client'
import { useEffect, useState } from 'react'
export default function Companies(){
  const [list,setList]=useState([]); const [f,setF]=useState({nome:'',cnpj:'',cpf:'',caepf:'',endereco:'',contato:'',telefone:'',email:''}); const [editing,setEditing]=useState(null)
  async function load(){ setList(await (await fetch('/api/companies')).json()) }
  async function create(e){ e.preventDefault(); await fetch('/api/companies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}); setF({nome:'',cnpj:'',cpf:'',caepf:'',endereco:'',contato:'',telefone:'',email:''}); load() }
  useEffect(()=>{ load() },[])
  return (<div className="space-y-4">
    <h1 className="text-2xl font-semibold">Empresas</h1>
    <form className="card grid md:grid-cols-3 gap-3" onSubmit={create}>
      <div><label className="hdr">Nome</label><input className="input" value={f.nome} onChange={e=>setF({...f,nome:e.target.value})} required/></div>
      <div><label className="hdr">CNPJ</label><input className="input" value={f.cnpj} onChange={e=>setF({...f,cnpj:e.target.value})}/></div>
      <div><label className="hdr">Contato</label><input className="input" value={f.contato} onChange={e=>setF({...f,contato:e.target.value})}/></div>
      <div><label className="hdr">Email</label><input className="input" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
      <div><button className="btn" type="submit">Adicionar</button></div>
    </form>
    <div className="card overflow-auto">
      <table className="table text-sm">
        <thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th>Email</th><th className="text-right">Ações</th></tr></thead>
        <tbody>
          {list.map(c=>(<tr key={c.id}>
            <td>{editing===c.id ? <input className="input" defaultValue={c.nome} onChange={e=>c._nome=e.target.value}/> : c.nome}</td>
            <td>{editing===c.id ? <input className="input" defaultValue={c.cnpj||c.cpf||c.caepf||''} onChange={e=>c._doc=e.target.value}/> : (c.cnpj||c.cpf||c.caepf||'—')}</td>
            <td>{editing===c.id ? <input className="input" defaultValue={c.contato||''} onChange={e=>c._contato=e.target.value}/> : (c.contato||'—')}</td>
            <td>{editing===c.id ? <input className="input" defaultValue={c.email||''} onChange={e=>c._email=e.target.value}/> : (c.email||'—')}</td>
            <td style={{textAlign:'right'}}>
              {editing===c.id ? (<>
                <button className="btn" onClick={async()=>{ await fetch('/api/companies/'+c.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ nome:c._nome||c.nome, email:c._email||c.email, contato:c._contato||c.contato, cnpj:c._doc })}); setEditing(null); load() }}>Salvar</button>
                <button className="btn" style={{opacity:.7,marginLeft:8}} onClick={()=>setEditing(null)}>Cancelar</button>
              </>) : (<>
                <button className="btn" onClick={()=>setEditing(c.id)}>Editar</button>
                <button className="btn" style={{background:'#dc2626',marginLeft:8}} onClick={async()=>{ if(confirm('Excluir empresa?')){ await fetch('/api/companies/'+c.id,{method:'DELETE'}); load() } }}>Excluir</button>
              </>)}
            </td>
          </tr>))}
        </tbody>
      </table>
    </div>
  </div>)
}
