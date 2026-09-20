import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import '../css/workflows.css';
export default function Alerts({ reception = false }) {
  const [rows,setRows]=useState([]),[error,setError]=useState('');
  useEffect(()=>{api(`/${reception?'recepcion':'admin'}/alertas`).then(setRows).catch(e=>setError(e.message));},[reception]);
  if(error)return <p role="alert">No se pudieron cargar los avisos: {error}</p>;
  if(!rows.length)return null;
  return <aside className="alert-list"><h3>Avisos de membresía ({rows.length})</h3><ul>{rows.map(r=><li key={r.id_usuario}>{r.nombre} {r.apellido} — {r.tipo}: {r.fecha_fin}</li>)}</ul></aside>;
}
