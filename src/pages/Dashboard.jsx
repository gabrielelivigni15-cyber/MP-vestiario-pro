import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { exportToExcel } from '../lib/exportExcel'

export default function Dashboard({goTo}){
  const [kpi,setKpi] = useState({articoli:0, persone:0, low:0, valore:0})
  const [top,setTop] = useState([])
  const [byTipo,setByTipo] = useState([])
  const [loading,setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const { count: aCount } = await supabase.from('articoli').select('*',{count:'exact', head:true})
    const { count: pCount } = await supabase.from('personale').select('*',{count:'exact', head:true})
    const { data: lowData } = await supabase.from('articoli').select('id, quantita').lte('quantita',5)
    const { data: valData } = await supabase.from('articoli').select('quantita, prezzo_unitario')
    const valore = (valData||[]).reduce((s,r)=>s + (Number(r.quantita||0)*Number(r.prezzo_unitario||0)),0)

    const { data: ass } = await supabase.from('assegnazioni').select('id_articolo, articolo:articoli(nome)')
    const cnt = {}; (ass||[]).forEach(r => { cnt[r.id_articolo] = (cnt[r.id_articolo]||0)+1 })
    const top5 = Object.entries(cnt).map(([id,qty]) => ({ id, qty, nome:(ass||[]).find(x=>x.id_articolo==id)?.articolo?.nome || '—' })).sort((a,b)=>b.qty-a.qty).slice(0,5)

    const { data: rows } = await supabase.from('articoli').select('tipo, quantita')
    const perTipo = {}; (rows||[]).forEach(r => { perTipo[r.tipo||'Altro'] = (perTipo[r.tipo||'Altro']||0) + (r.quantita||0) })
    const byTipoArr = Object.entries(perTipo).map(([tipo, q]) => ({ tipo, q }))

    setKpi({ articoli: aCount||0, persone: pCount||0, low:(lowData||[]).length, valore:Number(valore.toFixed(2)) })
    setTop(top5); setByTipo(byTipoArr); setLoading(false)
  }
  useEffect(()=>{ load(); const t=setInterval(load,10000); return ()=>clearInterval(t) },[])

  async function exportInventario(){
    const { data } = await supabase.from('articoli').select('id, nome, tipo, taglia, quantita, prezzo_unitario, fornitore, codice_fornitore, foto_url')
    exportToExcel('inventario-vestiario', data||[])
  }

  function Bars({data,labelKey='tipo', valueKey='q'}){
    const max = Math.max(1, ...data.map(d=>d[valueKey]))
    return (
      <div style={{display:'grid', gap:8}}>
        {data.map((d,i)=>(
          <div key={i} style={{display:'grid', gridTemplateColumns:'160px 1fr 60px', gap:8, alignItems:'center'}}>
            <div className="small" title={d[labelKey]} style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d[labelKey]}</div>
            <div style={{height:10, background:'#f0f2f6', borderRadius:999}}>
              <div style={{height:'100%', width:`${(d[valueKey]/max)*100}%`, background:'#C00000', borderRadius:999}}/>
            </div>
            <div className="small" style={{textAlign:'right'}}>{d[valueKey]}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid" style={{gap:18}}>
      <div className="grid grid-3">
        <section className="card kpi"><div className="label">Articoli totali</div><div className="value">{loading? '…' : kpi.articoli}</div><span className="small">Tutte le tipologie presenti</span></section>
        <section className="card kpi"><div className="label">Personale</div><div className="value">{loading? '…' : kpi.persone}</div><span className="small">Dipendenti censiti</span></section>
        <section className="card kpi"><div className="label">Da riordinare</div><div className="value" style={{color:'#C00000'}}>{loading? '…' : kpi.low}</div><span className="small">Scorta ≤ 5</span></section>
      </div>

      <section className="card grid grid-2">
        <div>
          <h3 style={{marginTop:0}}>Quantità per tipo</h3>
          <Bars data={byTipo}/>
        </div>
        <div>
          <h3 style={{marginTop:0}}>Più assegnati</h3>
          <Bars data={top.map(t=>({tipo:t.nome, q:t.qty}))}/>
        </div>
      </section>

      <section className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div className="label">Valore totale magazzino</div>
          <div className="value">€ {loading? '…' : kpi.valore.toLocaleString('it-IT',{minimumFractionDigits:2})}</div>
        </div>
        <div style={{display:'flex', gap:10}}>
          <Button onClick={exportInventario}>Scarica inventario Excel</Button>
          <Button variant="ghost" onClick={()=>goTo('Articoli')}>Gestisci articoli</Button>
          <Button variant="ghost" onClick={()=>goTo('Personale')}>Gestisci personale</Button>
          <Button variant="ghost" onClick={()=>goTo('Assegna')}>Assegna</Button>
          <Button variant="ghost" onClick={()=>goTo('Storico')}>Storico</Button>
        </div>
      </section>

      {kpi.low>0 && (<div className="notice">⚠️ {kpi.low} articoli sotto scorta. Valuta un riordino.</div>)}
    </div>
    {/* 🔥 Sezione consigli intelligenti */}
<section className="card">
  <h3 style={{marginTop:0}}>💡 Suggerimenti automatici</h3>
  <p style={{color:'#6b7280', marginTop:0}}>Analisi automatica basata sulle scorte attuali</p>

  {loading && <div>Analisi in corso...</div>}

  {!loading && kpi.low === 0 && (
    <div style={{color:'#16a34a', fontWeight:'700'}}>✅ Tutto sotto controllo. Nessun articolo sotto scorta.</div>
  )}

  {!loading && kpi.low > 0 && (
    <table className="table">
      <thead>
        <tr>
          <th>Articolo</th>
          <th>Fornitore</th>
          <th>Q.tà attuale</th>
          <th>Da riordinare</th>
          <th>Valore stimato (€)</th>
        </tr>
      </thead>
      <tbody>
        {rowsLow?.map((a,i) => {
          const daRiordinare = 20 - a.quantita
          const valore = (daRiordinare * (a.prezzo_unitario || 0)).toFixed(2)
          return (
            <tr key={i}>
              <td>{a.nome}</td>
              <td>{a.fornitore || '—'}</td>
              <td>{a.quantita}</td>
              <td>{daRiordinare > 0 ? daRiordinare : 0}</td>
              <td>{valore}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )}
</section>

  )
}
