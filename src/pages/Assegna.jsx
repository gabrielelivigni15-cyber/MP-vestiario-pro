import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { exportToExcel } from '../lib/exportExcel'

export default function Assegna(){
  const [persone,setPersone] = useState([])
  const [articoli,setArticoli] = useState([])
  const [form,setForm] = useState({ id_persona:'', id_articolo:'', data_consegna:new Date().toISOString().slice(0,10) })
  const [rows,setRows] = useState([])
  const [filtroPersona,setFiltroPersona] = useState('')
  const [editId,setEditId] = useState(null)
  const [editRow,setEditRow] = useState(null)

  async function load(){
    const { data: p } = await supabase.from('personale').select('id, nome').order('nome')
    const { data: a } = await supabase.from('articoli').select('id, nome').order('nome')
    const { data: r } = await supabase
      .from('assegnazioni')
      .select('id, id_persona, id_articolo, data_consegna, persona:personale (nome), articolo:articoli (nome)')
      .order('id')
    setPersone(p||[]); setArticoli(a||[]); setRows(r||[])
  }
  useEffect(()=>{ load() },[])

  async function add(){
    if(!form.id_persona || !form.id_articolo) return alert('Seleziona persona e articolo')
    const payload = {
      id_persona: parseInt(form.id_persona),
      id_articolo: parseInt(form.id_articolo),
      data_consegna: form.data_consegna
    }
    const { error } = await supabase.from('assegnazioni').insert([payload])
    if(!error){ setForm({ id_persona:'', id_articolo:'', data_consegna:new Date().toISOString().slice(0,10) }); load() } else alert(error.message)
  }

  async function remove(id){
    if(!confirm('Eliminare questa assegnazione?')) return
    const { error } = await supabase.from('assegnazioni').delete().eq('id',id)
    if(!error) load(); else alert(error.message)
  }

  function startEdit(r){
    setEditId(r.id)
    setEditRow({ id:r.id, id_persona:r.id_persona, id_articolo:r.id_articolo, data_consegna:r.data_consegna })
  }

  async function saveEdit(){
    if(!editRow.id_persona || !editRow.id_articolo) return alert('Seleziona persona e articolo')
    const oldId = editRow.id
    const del = await supabase.from('assegnazioni').delete().eq('id',oldId)
    if(del.error){ alert(del.error.message); return }
    const ins = await supabase.from('assegnazioni').insert([{
      id_persona: parseInt(editRow.id_persona),
      id_articolo: parseInt(editRow.id_articolo),
      data_consegna: editRow.data_consegna
    }])
    if(ins.error){ alert(ins.error.message); return }
    setEditId(null); setEditRow(null); load()
  }

  function exportAss(){
    const data = rows.map(r => ({ id:r.id, persona:r.persona?.nome||'', articolo:r.articolo?.nome||'', data:r.data_consegna }))
    exportToExcel('assegnazioni', data)
  }

  const filtered = rows.filter(r => !filtroPersona || (r.persona?.nome||'').toLowerCase().includes(filtroPersona.toLowerCase()))

  return (
    <div className="grid" style={{gap:18}}>
      <div className="card grid grid-2">
        <div className="grid" style={{gap:12}}>
          <select value={form.id_persona} onChange={e=>setForm({...form, id_persona:e.target.value})}>
            <option value="">Seleziona persona…</option>
            {persone.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select value={form.id_articolo} onChange={e=>setForm({...form, id_articolo:e.target.value})}>
            <option value="">Seleziona articolo…</option>
            {articoli.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <input className="input" type="date" value={form.data_consegna} onChange={e=>setForm({...form, data_consegna:e.target.value})}/>
          <div><Button onClick={add}>Assegna</Button></div>
        </div>

        <div className="grid" style={{gap:12}}>
          <input className="input" placeholder="Filtra per persona…" value={filtroPersona} onChange={e=>setFiltroPersona(e.target.value)}/>
          <Button variant="ghost" onClick={exportAss}>Esporta assegnazioni (Excel)</Button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Dipendente</th><th>Articolo</th><th>Data</th><th>Azioni</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{editId===r.id ? (
                  <select value={editRow?.id_persona||''} onChange={e=>setEditRow({...editRow, id_persona:e.target.value})}>
                    <option value="">Persona…</option>
                    {persone.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                ) : (r.persona?.nome)}</td>

                <td>{editId===r.id ? (
                  <select value={editRow?.id_articolo||''} onChange={e=>setEditRow({...editRow, id_articolo:e.target.value})}>
                    <option value="">Articolo…</option>
                    {articoli.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                ) : (r.articolo?.nome)}</td>

                <td>{editId===r.id ? (
                  <input className="input" type="date" value={editRow?.data_consegna||''} onChange={e=>setEditRow({...editRow, data_consegna:e.target.value})}/>
                ) : r.data_consegna}</td>

                <td style={{display:'flex', gap:8}}>
                  {editId===r.id
                    ? (<><Button onClick={saveEdit}>Salva</Button><Button variant="ghost" onClick={()=>{setEditId(null); setEditRow(null)}}>Annulla</Button></>)
                    : (<><Button variant="ghost" onClick={()=>startEdit(r)}>Modifica</Button><Button variant="ghost" onClick={()=>remove(r.id)}>Elimina</Button></>)
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
