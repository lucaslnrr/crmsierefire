'use client'
import { useState } from 'react'
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState('')
  async function onSubmit(e){ e.preventDefault(); setErr(''); const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); if(r.ok) window.location.href='/dashboard'; else setErr((await r.json()).error||'Falha') }
  return (<div className="max-w-sm mx-auto mt-16 card"><h1 className="text-xl font-semibold mb-4">Acesso</h1>
    <form onSubmit={onSubmit} className="space-y-3">
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button className="btn w-full">Entrar</button>
    </form></div>)
}
