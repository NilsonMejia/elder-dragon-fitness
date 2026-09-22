import { Notice, useNotifications } from '../../components/Notifications';
import { useCallback, useEffect, useState } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ExerciseEditor from '../../components/ExerciseEditor';
import { blankExercise } from '../../lib/routines';
import ProgressLog from '../../components/ProgressLog';
import { api } from '../../lib/api';

const empty = () => ({id_cliente:'',id_plantilla:'',nombre:'',notas:'',detalles:[blankExercise()]});
export default function Asignaciones(){
  const { confirm } = useNotifications();
  const [clients,setClients]=useState([]),[templates,setTemplates]=useState([]),[rows,setRows]=useState([]);
  const [form,setForm]=useState(empty),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState(null);
  const refresh=useCallback(async()=>{
    try{const [c,t,a]=await Promise.all([api('/deportivo/clientes'),api('/deportivo/rutinas'),api('/deportivo/asignaciones')]);setClients(c);setTemplates(t);setRows(a);}
    catch(e){setError(e.message);}
  },[]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Load the remote assignments and handle connection errors.
  useEffect(()=>{refresh();},[refresh]);
  const change=(key,v)=>setForm(f=>({...f,[key]:v}));
  function template(id){const t=templates.find(r=>String(r.id)===id);setForm(f=>({...f,id_plantilla:id,nombre:t?.nombre||'',detalles:t?.detalles.map(d=>({...d}))||[blankExercise()]}));}
  async function save(e){e.preventDefault();setBusy(true);setError('');setMessage('');try{
    await api('/deportivo/asignaciones',{method:'POST',body:form});setForm(empty());setMessage('Rutina asignada. La anterior queda en el historial.');await refresh();
  }catch(err){setError(err.message);}finally{setBusy(false);}}
  async function archive(row){if(!await confirm('¿Archivar esta asignación? Se conservará su seguimiento.', { title: 'Confirmar cambio', confirmLabel: 'Confirmar', danger: true }))return;try{await api(`/deportivo/asignaciones/${row.id_asignacion}/archivar`,{method:'PATCH'});setSelected(null);await refresh();}catch(e){setError(e.message);}}
  return <WorkspaceShell><header className="content-header"><h1>Rutinas y seguimiento</h1><p>Personaliza una plantilla o crea una rutina para tu cliente.</p></header>
    <Notice message={error} onClose={() => setError('')} /><Notice message={message} type="success" onClose={() => setMessage('')} />
    <form className="panel workflow-form" onSubmit={save}><h2>Nueva asignación</h2>
      <div className="workflow-grid"><label>Cliente<select aria-label="Cliente" required value={form.id_cliente} onChange={e=>change('id_cliente',e.target.value)}><option value="">Selecciona un cliente</option>{clients.filter(c=>c.estado!=='Inactivo').map(c=><option key={c.id_usuario} value={c.id_usuario}>{c.nombre} {c.apellido}</option>)}</select></label>
      <label>Plantilla<select aria-label="Plantilla" value={form.id_plantilla} onChange={e=>template(e.target.value)}><option value="">Rutina nueva</option>{templates.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}</select></label></div>
      <label>Nombre<input required maxLength={100} value={form.nombre} onChange={e=>change('nombre',e.target.value)}/></label>
      <ExerciseEditor value={form.detalles} onChange={d=>change('detalles',d)}/>
      <label>Indicaciones<textarea maxLength={5000} value={form.notas} onChange={e=>change('notas',e.target.value)}/></label>
      <button disabled={busy} className="btn-gradient">{busy?'Guardando…':'Asignar rutina'}</button>
    </form>
    <section className="panel"><h2>Asignaciones e historial</h2><div className="table-wrap"><table className="admin-table"><thead><tr><th>Cliente</th><th>Rutina</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{rows.map(a=><tr key={a.id_asignacion}><td>{a.cliente}</td><td>{a.nombre}</td><td>{a.activa?'Activa':'Archivada'}</td><td><button className="btn-outline" onClick={()=>setSelected(a)}>Seguimiento</button>{a.activa&&<button className="btn-outline" onClick={()=>archive(a)}>Archivar</button>}</td></tr>)}</tbody></table></div>{!rows.length&&<p>No hay asignaciones registradas.</p>}</section>
    {selected&&<ProgressLog key={selected.id_asignacion} assignment={selected}/>}
  </WorkspaceShell>;
}
