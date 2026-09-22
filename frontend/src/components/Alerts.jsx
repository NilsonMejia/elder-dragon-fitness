import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { MiniDialog, Notice } from './Notifications';
export default function Alerts({ reception = false }) {
  const [rows,setRows]=useState([]),[error,setError]=useState('');
  const [open,setOpen]=useState(false);
  useEffect(()=>{api(`/${reception?'recepcion':'admin'}/alertas`).then(setRows).catch(e=>setError(e.message));},[reception]);
  if(error)return <Notice message={`No se pudieron cargar los avisos: ${error}`} />;
  if(!rows.length)return null;
  return <div className="membership-notifications">
    <button type="button" className="membership-trigger" aria-haspopup="dialog" onClick={()=>setOpen(true)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      Avisos de membresía <span className="membership-count">{rows.length}</span>
    </button>
    <MiniDialog open={open} title={`Avisos de membresía (${rows.length})`} onClose={()=>setOpen(false)}>
      <ul className="membership-list">{rows.map(r=><li key={r.id_usuario}><strong>{r.nombre} {r.apellido}</strong><span>{r.tipo} · {r.fecha_fin}</span></li>)}</ul>
    </MiniDialog>
  </div>;
}
