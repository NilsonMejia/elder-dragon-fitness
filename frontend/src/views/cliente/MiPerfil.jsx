import { Notice } from '../../components/Notifications';
import { useEffect, useState } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import { api, sessionUser } from '../../lib/api';

const formatDate = value => value ? new Date(value).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha';

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/cliente/perfil').then(data => {
      setPerfil(data.cliente);
      setPagos(Array.isArray(data.pagos) ? data.pagos : []);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  const nombre = perfil?.nombre || sessionUser()?.nombre || 'Cliente';
  const estado = perfil?.estado || 'Sin estado';
  const activo = estado.toLowerCase() === 'activo';
  return <WorkspaceShell>
    <Notice message={error} onClose={() => setError('')} />
    <header className="content-header workspace-header"><div><span className="workspace-eyebrow">MI CUENTA</span><h1>Hola, {nombre}</h1><p>Consulta el estado de tu membresía y tus próximos pagos.</p></div></header>
    <section className="panel membership-summary" aria-label="Estado de membresía">
      <div><span className={`membership-status ${activo ? 'is-active' : ''}`}>ESTADO: {loading ? 'CARGANDO' : estado.toUpperCase()}</span><h2>{perfil?.nombre_plan || 'Sin membresía'}</h2><p>{loading ? 'Consultando tu membresía…' : error ? 'No se pudo consultar el estado de tu plan.' : `Tu membresía ${activo ? 'está al día.' : 'requiere revisión.'}`}</p></div>
      <div className="membership-date"><span>Próximo Corte</span><strong>{formatDate(perfil?.fecha_fin)}</strong></div>
    </section>
    <section className="panel"><div className="workspace-panel-heading"><div><h2>Historial de Pagos Recientes</h2><p>Consulta los pagos registrados de tu membresía.</p></div></div>
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Fecha de Pago</th><th>Monto</th><th>Plan Renovado</th><th>Método</th></tr></thead><tbody>
        {loading && <tr><td colSpan="4">Cargando pagos...</td></tr>}
        {!loading && pagos.map(pago => <tr key={pago.id_pago}><td>{formatDate(pago.fecha_pago)}</td><td className="workspace-amount">${Number(pago.monto).toFixed(2)}</td><td>{pago.nombre_plan}</td><td>{pago.metodo_pago}</td></tr>)}
        {!loading && !pagos.length && <tr><td colSpan="4" className="workspace-table-empty">No hay pagos registrados en tu historial.</td></tr>}
      </tbody></table></div>
    </section>
  </WorkspaceShell>;
}
