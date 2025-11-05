import React, { useState } from 'react'
import './styles.css'
import Dashboard from './pages/Dashboard'
import Articoli from './pages/Articoli'
import Personale from './pages/Personale'
import Assegna from './pages/Assegna'
import Storico from './pages/Storico'

const NAV = ['Dashboard','Articoli','Personale','Assegna','Storico']

export default function App(){
  const [tab,setTab] = useState('Dashboard')
  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <img src="/logo-medipower.png" alt="MediPower"/>
          <div>
            <div>MP Vestiario Pro <span className="subtitle">— powered by Medipower</span></div>
            <div className="subtitle">Our energy, Your Power</div>
          </div>
        </div>
        <div className="badge-live">Live dashboard</div>
      </header>
      <aside className="sidebar">
        <h4 className="nav-title">Navigazione</h4>
        {NAV.map(n => (<button key={n} onClick={()=>setTab(n)} className={`nav-btn ${tab===n?'active':''}`}>{n}</button>))}
        <div className="footer-note">MP Vestiario © Medipower</div>
      </aside>
      <main className="content">
        {tab==='Dashboard' && <Dashboard goTo={(t)=>setTab(t)}/>}
        {tab==='Articoli' && <Articoli/>}
        {tab==='Personale' && <Personale/>}
        {tab==='Assegna' && <Assegna/>}
        {tab==='Storico' && <Storico/>}
      </main>
    </div>
  )
}
