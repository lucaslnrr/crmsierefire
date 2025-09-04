'use client'
import { useEffect, useState } from 'react'
export default function Companies(){
  const [list,setList]=useState([]); const [f,setF]=useState({nome:'',cnpj:'',cpf:'',caepf:'',endereco:'',contato:'',telefone:'',email:''})
  async function load(){ setList(await (await fetch('/api/companies')).json()) }
  useEffect(()=>{ load() },[])
  async function onSubmit(e){ e.preventDefault(); await fetch('/api/companies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}); setF({nome:'',cnpj:'',cpf:'',caepf:'',endereco:'',contato:'',telefone:'',email:''}); load() }
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">Empresas</h1><div className="card">
    <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-3">{['nome','cnpj','cpf','caepf','endereco','contato','telefone','email'].map(k=>(<input key={k} className="input" placeholder={k.toUpperCase()} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} />))}<div className="md:col-span-3"><button className="btn">Salvar</button></div></form></div>
    <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th>Email</th></tr></thead><tbody>{list.map(c=>(<tr key={c.id} className="border-t"><td>{c.nome}</td><td>{c.cnpj||c.cpf||c.caepf||'—'}</td><td>{c.contato||'—'}</td><td>{c.email||'—'}</td></tr>))}</tbody></table></div></div>)
}
