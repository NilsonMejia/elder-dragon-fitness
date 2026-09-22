import { Notice } from './Notifications';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
export default function ProgressLog({ assignment, client = false }) {
  const [rows,setRows]=useState([]);
  const [text,setText]=useState('');
  const [complete,setComplete]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const url=`/${client?'cliente':'deportivo'}/asignaciones/${assignment.id_asignacion}/seguimiento`;
  const refresh=useCallback(()=>api(url).then(setRows).catch(e=>setError(e.message)),[url]);
  useEffect(()=>{refresh();},[refresh]);
  async function save(e){
    e.preventDefault();setBusy(true);setError('');
    try {await api(url,{method:'POST',body:{observaciones:text,completada:complete}});setText('');setComplete(false);await refresh();}
    catch(err){setError(err.message);}finally{setBusy(false);}
  }
  return <section className="panel workflow-form"><h3>Seguimiento: {assignment.nombre}</h3>
    <Notice message={error} onClose={() => setError('')} />
    {assignment.activa&&<form onSubmit={save}><label>Observaciones<textarea required maxLength={5000} value={text} onChange={e=>setText(e.target.value)}/></label>
      <label><input type="checkbox" checked={complete} onChange={e=>setComplete(e.target.checked)}/> Sesión completada</label>
      <button className="btn-gradient" disabled={busy}>Guardar seguimiento</button></form>}
    {!rows.length&&<p>Aún no hay registros.</p>}
    {rows.map(r=><article key={r.id_seguimiento} className="progress-entry"><strong>{r.autor} · {new Date(r.fecha).toLocaleString()}</strong><p>{r.observaciones}</p>{r.completada&&<small>Sesión completada</small>}</article>)}
  </section>;
}
