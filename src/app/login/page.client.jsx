'use client'
import { useState } from 'react'

export default function LoginClient(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')

  async function submit(e){
    e.preventDefault()
    setMsg('')
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    if(r.ok){ window.location.href='/dashboard' } else { setMsg('Credenciais inválidas') }
  }

  return (
    <div className="container" style={{maxWidth:420, paddingTop:60}}>
      <div className="card">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <form className="space-y-3" onSubmit={submit}>
          <div><label className="hdr">Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label className="hdr">Senha</label><input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          {msg && <div style={{color:'#dc2626', fontSize:14}}>{msg}</div>}
          <button className="btn" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}
