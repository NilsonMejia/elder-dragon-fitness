import { useEffect, useState } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ProgressLog from '../../components/ProgressLog';
import { api } from '../../lib/api';

export default function MiRutina(){
  const [routine,setRoutine]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{api('/cliente/rutina').then(setRoutine).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  return <WorkspaceShell><header className="content-header"><h1>Mi rutina</h1></header>
    {error&&<p role="alert">{error}</p>}{loading&&<p>Cargando rutina…</p>}
    {!loading&&!error&&!routine&&<p>Aún no tienes una rutina asignada. Consulta con tu entrenador.</p>}
    {routine&&<><section className="panel"><h2>{routine.nombre}</h2><p>Entrenador: {routine.entrenador}</p><p>{routine.notas}</p><div className="table-wrap"><table className="admin-table"><thead><tr><th>Ejercicio</th><th>Series</th><th>Repeticiones</th><th>Peso</th><th>Descanso</th></tr></thead><tbody>{routine.detalles.map((d,i)=><tr key={i}><td>{d.texto}</td><td>{d.series}</td><td>{d.repeticiones}</td><td>{d.peso}</td><td>{d.descanso_segundos} s</td></tr>)}</tbody></table></div></section><ProgressLog assignment={routine} client/></>}
  </WorkspaceShell>;
}
