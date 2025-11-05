import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'

export default function Personale(){
  const empty = { nome:'', qualifica:'', tshirt:'M', pantaloni:'M', gilet:'M', note:'', attivo:true }
  const [form,setForm] = useState(empty)
  const [rows,setRows] = useState([])
  const [query,setQuery] = useState('')
  const [editId,setEditId] = useState(null)

  async function load(){
    const { data } = await supabase.from('personale').select('*').order('id',{ascending:true})
    setRows(data||[])
  }
  useEffect(()=>{ load() },[])

  async function add(){
    const { error } = await supabase.from('personale').insert([form])
    if(!error){ setForm(empty); load() } else alert(error.message)
  }
  async function del(id){
    if(!confirm('Eliminare persona?')) return
    const { error } = await supabase.from('personale').delete().eq('id',id)
    if(!error) load(); else alert(error.message)
  }
  async function saveEdit(row){
    const { error } = await supabase.from('personale').update(row).eq('id',row.id)
    if(!error){ setEditId(null); load() } else alert(error.message)
  }

  const filtered = rows.filter(r=>{
    const t = (query||'').toLowerCase()
    return !t || [r.nome,r.qualifica].some(x=>(x||'').toLowerCase().includes(t))
  })

  return (
    <div className="grid" style={{gap:18}}>
      <div className="card grid grid-3">
        <input className="input" placeholder="Cerca per nome/qualifica…" value={query} onChange={e=>setQuery(e.target.value)}/>
        <div />
        <div />
        <input className="input" placeholder="Nome e cognome" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})}/>
        <input className="input" placeholder="Qualifica" value={form.qualifica} onChange={e=>setForm({...form, qualifica:e.target.value})}/>
        <select value={form.tshirt} onChange={e=>setForm({...form, tshirt:e.target.value})}>
          <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
        </select>
        <input className="input" placeholder="Pantaloni" value={form.pantaloni} onChange={e=>setForm({...form, pantaloni:e.target.value})}/>
        <input className="input" placeholder="Gilet/Giubbotto" value={form.gilet} onChange={e=>setForm({...form, gilet:e.target.value})}/>
        <input className="input" placeholder="Note" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}/>
        <select value={form.attivo? 'true':'false'} onChange={e=>setForm({...form, attivo: e.target.value==='true'})}>
          <option value="true">Attivo</option>
          <option value="false">Sospeso</option>
        </select>
        <div style={{display:'flex', alignItems:'center'}}><Button onClick={add}>+ Aggiungi</Button></div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Nome</th><th>Qualifica</th><th>T-shirt</th><th>Pantaloni</th><th>Gilet</th><th>Stato</th><th>Note</th><th>Azioni</th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{editId===r.id ? <input className="input" value={r.nome} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, nome:e.target.value}:x))}/> : r.nome}</td>
                <td>{editId===r.id ? <input className="input" value={r.qualifica||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, qualifica:e.target.value}:x))}/> : (r.qualifica||'—')}</td>
                <td>{editId===r.id ? <input className="input" value={r.tshirt||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, tshirt:e.target.value}:x))}/> : (r.tshirt||'—')}</td>
                <td>{editId===r.id ? <input className="input" value={r.pantaloni||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, pantaloni:e.target.value}:x))}/> : (r.pantaloni||'—')}</td>
                <td>{editId===r.id ? <input className="input" value={r.gilet||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, gilet:e.target.value}:x))}/> : (r.gilet||'—')}</td>
                <td>{editId===r.id ? (
                  <select value={r.attivo? 'true':'false'} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, attivo: e.target.value==='true'}:x))}>
                    <option value="true">Attivo</option>
                    <option value="false">Sospeso</option>
                  </select>
                ) : (r.attivo? 'Attivo':'Sospeso')}</td>
                <td>{editId===r.id ? <input className="input" value={r.note||''} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x, note:e.target.value}:x))}/> : (r.note||'—')}</td>
                <td style={{display:'flex', gap:8}}>
                  {editId===r.id
                    ? (<><Button onClick={()=>saveEdit(r)}>Salva</Button><Button variant="ghost" onClick={()=>setEditId(null)}>Annulla</Button></>)
                    : (<><Button variant="ghost" onClick={()=>setEditId(r.id)}>Modifica</Button><Button variant="ghost" onClick={()=>del(r.id)}>Elimina</Button></>)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
