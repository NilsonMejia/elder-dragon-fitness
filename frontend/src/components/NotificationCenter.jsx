import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { MiniDialog } from './Notifications';

const descriptions = {
  Administrador: 'Vencimientos de membresías para la administración del gimnasio.',
  Recepcionista: 'Membresías que requieren atención en recepción.',
  Entrenador: 'Actividad reciente de los clientes en tus rutinas asignadas.',
  Cliente: 'Avisos de tu membresía, tu rutina y las indicaciones de tu entrenador.',
};
const labels = { membership: 'Membresía', routine: 'Rutina', feedback: 'Entrenador', progress: 'Seguimiento' };
function dateLabel(value) {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationCenter({ role }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    let active = true;
    let controller;
    async function refresh() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      setLoading(true);
      try {
        const data = await api('/notificaciones', { signal: request.signal });
        if (active && !request.signal.aborted) { setRows(data); setError(''); }
      } catch (failure) {
        if (active && !request.signal.aborted) setError(failure.message);
      } finally {
        if (active && !request.signal.aborted) setLoading(false);
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { active = false; controller?.abort(); window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [pathname, role, open, revision]);

  return <>
    <div className="notification-center-access">
      <button type="button" className="membership-trigger notification-center-trigger" aria-haspopup="dialog"
        aria-label={`Notificaciones${error ? ': no disponibles' : loading ? ': actualizando' : `: ${rows.length} avisos`}`}
        onClick={() => setOpen(true)}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        <span>Notificaciones</span><span className="membership-count" aria-hidden="true">{error ? '!' : loading ? '…' : rows.length}</span>
      </button>
    </div>
    <MiniDialog open={open} title="Notificaciones" onClose={() => setOpen(false)}>
      <p className="notification-description">{descriptions[role]}</p>
      {loading && <p className="notification-feed-state" role="status">Actualizando avisos…</p>}
      {error ? <div className="notification-feed-state" role="alert"><p>No se pudieron cargar las notificaciones.</p><p>{error}</p>
        <button type="button" className="membership-trigger" onClick={() => setRevision(value => value + 1)}>Reintentar</button>
      </div> : !loading && !rows.length ? <div className="notification-empty"><strong>No tienes avisos por ahora</strong><p>Las novedades de tu cuenta aparecerán aquí.</p></div> :
        <ul className="notification-feed">{rows.map(row => <li key={row.id}>
          <div className="notification-feed-meta"><span>{labels[row.kind] || 'Aviso'}</span><time dateTime={row.date || undefined}>{dateLabel(row.date)}</time></div>
          <strong>{row.title}</strong><p>{row.message}</p>
          {row.href && <Link to={row.href} onClick={() => setOpen(false)}>Ver detalle <span aria-hidden="true">→</span></Link>}
        </li>)}</ul>}
    </MiniDialog>
  </>;
}
