import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { exportToExcel, exportToPDFFromHTML } from '../lib/exportExcel'

export default function Storico(){
  const [persone,setPersone] = useState([])
  const [sel,setSel] = useState('')
  const [rows,setRows] = useState([])
  const [totali,setTotali] = useState({})

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.from('personale').select('id, nome').order('nome')
      setPersone(data||[])
    })()
  },[])

  async function loadStorico(id){
    const { data } = await supabase
      .from('assegnazioni')
      .select('data_consegna, articolo:articoli (nome, tipo, taglia)')
      .eq('id_persona', id)
      .order('data_consegna', { ascending:false })
    setRows(data||[])
    const tot = {}; (data||[]).forEach(r => { const k=r.articolo?.tipo||'Altro'; tot[k]=(tot[k]||0)+1 })
    setTotali(tot)
  }

  function exportStoricoExcel(){
    const out = rows.map(r => ({ data:r.data_consegna, articolo:r.articolo?.nome||'', tipo:r.articolo?.tipo||'', taglia:r.articolo?.taglia||'' }))
    exportToExcel(`storico_${(persone.find(p=>p.id==sel)?.nome||'')}`, out)
  }

  function exportStoricoPDF(){
    const persona = persone.find(p=>p.id==sel)?.nome || ''
    const html = `
      <h2>Storico assegnazioni — ${persona}</h2>
      <table>
        <thead><tr><th>Data</th><th>Articolo</th><th>Tipo</th><th>Taglia</th></tr></thead>
        <tbody>
          ${rows.map(r=>`<tr><td>${r.data_consegna}</td><td>${r.articolo?.nome||''}</td><td>${r.articolo?.tipo||''}</td><td>${r.articolo?.taglia||''}</td></tr>`).join('')}
        </tbody>
      </table>
      <h3>Totali per categoria</h3>
      <table>
        <thead><tr><th>Categoria</th><th>Q.tà</th></tr></thead>
        <tbody>
          ${Object.entries(totali).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        </tbody>
      </table>
    `
    exportToPDFFromHTML('Storico assegnazioni', html)
  }

  return (
    <div className="grid" style={{gap:18}}>
      <div className="card grid grid-2">
        <div className="grid" style={{gap:12}}>
          <select value={sel} onChange={e=>{setSel(e.target.value); if(e.target.value) loadStorico(parseInt(e.target.value))}}>
            <option value="">Seleziona persona…</option>
            {persone.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <Button variant="ghost" onClick={exportStoricoExcel} disabled={!rows.length}>Esporta Excel</Button>
          <Button variant="ghost" onClick={exportStoricoPDF} disabled={!rows.length}>Esporta PDF</Button>
        </div>
      </div>

      <div className="card">
        {!sel ? <div className="small">Seleziona una persona per vedere lo storico.</div> : (
          <table className="table">
            <thead><tr><th>Data</th><th>Articolo</th><th>Tipo</th><th>Taglia</th></tr></thead>
            <tbody>
              {rows.map((r,i)=>(<tr key={i}><td>{r.data_consegna}</td><td>{r.articolo?.nome}</td><td>{r.articolo?.tipo}</td><td>{r.articolo?.taglia||'—'}</td></tr>))}
            </tbody>
          </table>
        )}
      </div>

      {Object.keys(totali).length>0 && (
        <div className="card">
          <h3 style={{marginTop:0}}>Totali per categoria</h3>
          <table className="table">
            <thead><tr><th>Categoria</th><th>Q.tà</th></tr></thead>
            <tbody>
              {Object.entries(totali).map(([k,v])=>(<tr key={k}><td>{k}</td><td>{v}</td></tr>))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
