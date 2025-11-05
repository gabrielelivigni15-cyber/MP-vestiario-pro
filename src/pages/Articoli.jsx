import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'

export default function Articoli(){
  const empty = { nome:'', tipo:'T-shirt/Polo', taglia:'M', quantita:1, prezzo_unitario:0, fornitore:'', codice_fornitore:'', foto_url:'' }
  const [form,setForm] = useState(empty)
  const [rows,setRows] = useState([])
  const [query,setQuery] = useState('')
  const [editId,setEditId] = useState(null)
  const [preview,setPreview] = useState(null)
  const [view,setView] = useState('table')

  async function load(){
    const { data } = await supabase.from('articoli').select('*').order('id',{ascending:true})
    setRows(data||[])
  }
  useEffect(()=>{ load() },[])

  async function add(){
    const { error } = await supabase.from('articoli').insert([form])
    if(!error){ setForm(empty); load() } else alert(error.message)
  }
  async function del(id){
    if(!confirm('Eliminare articolo?')) return
    const { error } = await supabase.from('articoli').delete().eq('id',id)
    if(!error) load(); else alert(error.message)
  }
  async function saveEdit(row){
    const { error } = await supabase.from('articoli').update(row).eq('id',row.id)
    if(!error){ setEditId(null); load() } else alert(error.message)
  }

  const filtered = rows.filter(r=>{
    const t = (query||'').toLowerCase()
    return !t || [r.nome,r.tipo,r.fornitore,r.codice_fornitore].some(x=>(x||'').toLowerCase().includes(t))
  })

  return (
    <div className="grid" style={{gap:18}}>
      <div className="card grid grid-3">
        <div style={{display:'flex',gap:8}}>
          <input className="input" placeholder="Cerca per nome/fornitore/codice…" value={query} onChange={e=>setQuery(e.target.value)}/>
          <Button variant="ghost" onClick={()=>setView(view==='table'?'cards':'table')}>{view==='table'?'Vista card':'Vista tabella'}</Button>
        </div>
        <div />
        <div />
        <input className="input" placeholder="Nome capo" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})}/>
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
          <option>T-shirt/Polo</option><option>Pantaloni</option><option>Gilet/Giubbotto</option>
        </select>
        <input className="input" placeholder="Taglia" value={form.taglia} onChange={e=>setForm({...form, taglia:e.target.value})}/>
        <input className="input" type="number" placeholder="Q.tà" value={form.quantita} onChange={e=>setForm({...form, quantita:parseInt(e.target.value||'0')})}/>
        <input className="input" type="number" step="0.01" placeholder="Prezzo unitario (€)" value={form.prezzo_unitario} onChange={e=>setForm({...form, prezzo_unitario:Number(e.target.value||0)})}/>
        <input className="input" placeholder="Fornitore" value={form.fornitore} onChange={e=>setForm({...form, fornitore:e.target.value})}/>
        <input className="input" placeholder="Codice fornitore" value={form.codice_fornitore} onChange={e=>setForm({...form, codice_fornitore:e.target.value})}/>
        <input className="input" placeholder="URL foto (opzionale)" value={form.foto_url} onChange={e=>setForm({...form, foto_url:e.target.value})}/>
        <div style={{display:'flex', alignItems:'center'}}><Button onClick={add}>+ Aggiungi</Button></div>
      </div>

      {view==='table' ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Taglia</th><th>Q.tà</th><th>Prezzo</th><th>Fornitore</th><th>Foto</th><th>Azioni</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{editId===r.id ? <input className="input" value={r.nome} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, nome:e.target.value}:x))}/> : r.nome}</td>
                  <td>{editId===r.id ? (
                    <select value={r.tipo} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, tipo:e.target.value}:x))}>
                      <option>T-shirt/Polo</option><option>Pantaloni</option><option>Gilet/Giubbotto</option>
                    </select>
                  ) : r.tipo}</td>
                  <td>{editId===r.id ? <input className="input" value={r.taglia||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, taglia:e.target.value}:x))}/> : (r.taglia||'—')}</td>
                  <td>{editId===r.id ? <input className="input" type="number" value={r.quantita||0} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, quantita:parseInt(e.target.value||'0')}:x))}/> : r.quantita}</td>
                  <td>{editId===r.id ? <input className="input" type="number" step="0.01" value={r.prezzo_unitario||0} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, prezzo_unitario:Number(e.target.value||0)}:x))}/> : (Number(r.prezzo_unitario||0).toFixed(2))}</td>
                  <td>{editId===r.id ? <input className="input" value={r.fornitore||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, fornitore:e.target.value}:x))}/> : (r.fornitore||'—')}</td>
                  <td>{r.foto_url ? (<img src={r.foto_url} alt="" style={{height:36,borderRadius:6,cursor:'zoom-in'}} onClick={()=>setPreview(r.foto_url)}/>) : <span className="small">-</span>}</td>
                  <td style={{display:'flex', gap:8}}>
                    {editId===r.id ? (<><Button onClick={()=>saveEdit(r)}>Salva</Button><Button variant="ghost" onClick={()=>setEditId(null)}>Annulla</Button></>)
                    : (<><Button variant="ghost" onClick={()=>setEditId(r.id)}>Modifica</Button><Button variant="ghost" onClick={()=>del(r.id)}>Elimina</Button></>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card card-grid">
          {filtered.map(r => (
            <div className="item-card" key={r.id}>
              {r.foto_url ? <img src={r.foto_url} alt=""/> : <div style={{height:160,display:'grid',placeItems:'center',color:'#9ca3af'}}>Nessuna immagine</div>}
              <div className="body">
                <div className="title">{r.nome}</div>
                <div className="meta">Tipo: {r.tipo} • Taglia: {r.taglia||'—'}</div>
                <div className="meta">Q.tà: <b>{r.quantita}</b> • Prezzo: € {Number(r.prezzo_unitario||0).toFixed(2)}</div>
                <div className="meta">Fornitore: {r.fornitore||'—'} • Cod: {r.codice_fornitore||'—'}</div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <Button variant="ghost" onClick={()=>setPreview(r.foto_url||'')}>Anteprima</Button>
                  <Button variant="ghost" onClick={()=>setEditId(r.id)}>Modifica</Button>
                  <Button variant="ghost" onClick={()=>del(r.id)}>Elimina</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div onClick={()=>setPreview(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex',alignItems:'center',justifyContent:'center', zIndex:50}}>
          <img src={preview} alt="" style={{maxWidth:'90vw', maxHeight:'90vh', borderRadius:12, boxShadow:'0 20px 40px rgba(0,0,0,.35)'}}/>
        </div>
      )}
    </div>
  )
}
