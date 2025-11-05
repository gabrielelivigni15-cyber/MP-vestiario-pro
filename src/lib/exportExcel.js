import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function exportToExcel(filename, rows){
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dati')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.xlsx`)
}

export function exportToPDFFromHTML(title, html){
  const w = window.open('', '_blank')
  const today = new Date().toLocaleDateString('it-IT')
  w.document.write(`<!doctype html><html><head><meta charset="utf-8">
  <title>${title}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui;margin:30px}
    .head{display:flex;align-items:center;gap:12px;margin-bottom:12px}
    .sub{color:#6b7280;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th,td{border:1px solid #e5e7eb;padding:8px 10px;font-size:13px}
    th{background:#f9fafb;text-align:left}
  </style>
  </head><body>
  <div class="head">
    <img src="${window.location.origin}/logo-medipower.png" style="height:40px"/>
    <div>
      <div style="font-weight:800">MP Vestiario Pro – Medipower</div>
      <div class="sub">Generato il ${today}</div>
    </div>
  </div>
  ${html}
  </body></html>`)
  w.document.close(); w.focus(); w.print()
}
