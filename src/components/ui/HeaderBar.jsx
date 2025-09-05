'use client'
import React from 'react'

export default function HeaderBar(){
  return (
    <header className="sf-header">
      <div className="sf-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="#021ED1"/></svg>
        <span>App</span>
      </div>
      <div className="sf-actions">
        <button className="sf-btn sf-btn--accent">Ação</button>
      </div>
    </header>
  )
}