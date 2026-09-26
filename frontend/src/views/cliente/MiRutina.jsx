import { Notice } from '../../components/Notifications';
import { useEffect, useState } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ProgressLog from '../../components/ProgressLog';
import { api } from '../../lib/api';

export default function MiRutina() {
  const [routine, setRoutine] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { api('/cliente/rutina').then(setRoutine).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <WorkspaceShell>
    <header className="content-header workspace-header"><div><span className="workspace-eyebrow">MI ENTRENAMIENTO</span><h1>Mi rutina</h1><p>Tu plan de entrenamiento y seguimiento en un solo lugar.</p></div></header>
    <Notice message={error} onClose={() => setError('')} />
    {loading && <section className="panel workspace-empty" role="status"><p>Cargando rutina…</p></section>}
    {!loading && !error && !routine && <section className="panel workspace-empty">
      <div className="workspace-empty-icon" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m6 6 12 12M3 9l6-6M15 21l6-6M2 6l4-4M18 22l4-4" /></svg></div>
      <h2>Tu próximo entrenamiento empieza aquí</h2><p>Aún no tienes una rutina asignada. Consulta con tu entrenador.</p><span className="workspace-empty-hint">Cuando esté lista, podrás ver tus ejercicios y registrar tu progreso.</span>
    </section>}
    {routine && <><section className="panel"><div className="workspace-panel-heading"><div><span className="workspace-eyebrow">RUTINA ACTUAL</span><h2>{routine.nombre}</h2><p>Entrenador: {routine.entrenador}</p></div><span className="workspace-count">{routine.detalles.length} ejercicios</span></div>{routine.notas && <p className="workspace-notes">{routine.notas}</p>}<div className="table-wrap"><table className="admin-table"><thead><tr><th>Ejercicio</th><th>Series</th><th>Repeticiones</th><th>Peso</th><th>Descanso</th></tr></thead><tbody>{routine.detalles.map((d, i) => <tr key={i}><td>{d.texto}</td><td>{d.series}</td><td>{d.repeticiones}</td><td>{d.peso}</td><td>{d.descanso_segundos} s</td></tr>)}</tbody></table></div></section><ProgressLog assignment={routine} client /></>}
  </WorkspaceShell>;
}
