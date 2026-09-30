import React, { useEffect, useState, useCallback } from 'react';
import { Notice, useNotifications } from '../../components/Notifications';
import WorkspaceShell from '../../components/WorkspaceShell';
import { api, sessionUser } from '../../lib/api';

const formatDate = (value) =>
  value
    ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('es-SV', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Sin fecha';

export default function MiPerfil() {
  const { notify } = useNotifications();
  const [perfil, setPerfil] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await api('/cliente/perfil');
      setPerfil(data.cliente);
      setPagos(Array.isArray(data.pagos) ? data.pagos : []);
      if (isManual) {
        notify('Tu estado de cuenta y pagos han sido actualizados.', 'info');
      }
    } catch (e) {
      setError(e.message || 'No se pudo cargar la información de tu perfil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const nombre = perfil?.nombre || sessionUser()?.nombre || 'Cliente';
  const estado = perfil?.estado || 'Sin estado';
  const activo = estado.toLowerCase() === 'activo';

  // Cálculo de días restantes
  const diasRestantes = perfil?.fecha_fin
    ? Math.ceil((new Date(perfil.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <WorkspaceShell>
      <Notice message={error} onClose={() => setError('')} />

      <header className="content-header workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="workspace-eyebrow" style={{ color: '#00ff88', fontWeight: '800', letterSpacing: '1px' }}>MI CUENTA</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: '#fff' }}>Hola, {nombre}</h1>
          <p style={{ color: '#8e9ba8', margin: 0 }}>Consulta el estado de tu membresía, beneficios y tus próximos pagos.</p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          style={{
            padding: '10px 18px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <span>↻</span> {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </header>

      {/* Tarjetas de Métricas del Atleta */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: `3px solid ${activo ? '#00ff88' : '#ff4d4d'}` }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>ESTADO ACTUAL</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '10px 0 4px', color: activo ? '#00ff88' : '#ff4d4d' }}>
            {loading ? '...' : estado.toUpperCase()}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#8e9ba8' }}>{activo ? 'Acceso habilitado' : 'Membresía requiere revisión'}</span>
        </div>

        <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #00d4ff' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>PLAN ASIGNADO</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '10px 0 4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {loading ? '...' : perfil?.nombre_plan || 'Sin membresía'}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#00d4ff' }}>Tarifa fija del plan</span>
        </div>

        <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>VENCIMIENTO</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '10px 0 4px', color: diasRestantes !== null && diasRestantes <= 5 ? '#f59e0b' : '#fff' }}>
            {loading ? '...' : diasRestantes !== null ? (diasRestantes > 0 ? `${diasRestantes} días` : diasRestantes === 0 ? 'Vence hoy' : 'Vencido') : 'N/A'}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#8e9ba8' }}>{formatDate(perfil?.fecha_fin)}</span>
        </div>

        <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #bb00ff' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>PAGOS REGISTRADOS</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: '10px 0 4px', color: '#fff' }}>
            {loading ? '...' : pagos.length}
          </p>
          <span style={{ fontSize: '0.78rem', color: '#8e9ba8' }}>En tu historial</span>
        </div>
      </section>

      {/* Resumen de Membresía requerido para tests */}
      <section className="panel membership-summary" aria-label="Estado de membresía" style={{ marginBottom: '28px' }}>
        <div>
          <span className={`membership-status ${activo ? 'is-active' : ''}`}>
            ESTADO: {loading ? 'CARGANDO' : estado.toUpperCase()}
          </span>
          <h2>{perfil?.nombre_plan || 'Sin membresía'}</h2>
          <p>
            {loading
              ? 'Consultando tu membresía…'
              : error
              ? 'No se pudo consultar el estado de tu plan.'
              : `Tu membresía ${activo ? 'está al día.' : 'requiere revisión o renovación en recepción.'}`}
          </p>
        </div>
        <div className="membership-date">
          <span>Próximo Corte</span>
          <strong>{formatDate(perfil?.fecha_fin)}</strong>
        </div>
      </section>

      {/* Historial de Pagos */}
      <section className="panel" style={{ background: '#10161e', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="workspace-panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Historial de Pagos Recientes</h2>
            <p style={{ color: '#8e9ba8', fontSize: '0.88rem', margin: '4px 0 0 0' }}>Consulta los pagos y recibos registrados de tu membresía.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha de Pago</th>
                <th>Monto</th>
                <th>Plan Renovado</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#8e9ba8' }}>
                    Cargando pagos...
                  </td>
                </tr>
              )}
              {!loading &&
                pagos.map((pago) => (
                  <tr key={pago.id_pago}>
                    <td>{formatDate(pago.fecha_pago)}</td>
                    <td className="workspace-amount" style={{ color: '#00ff88', fontWeight: 700 }}>
                      ${Number(pago.monto).toFixed(2)}
                    </td>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{pago.nombre_plan}</td>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: 'rgba(255,255,255,0.05)',
                          color: '#00d4ff',
                          border: '1px solid rgba(0,212,255,0.2)'
                        }}
                      >
                        {pago.metodo_pago}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && !pagos.length && (
                <tr>
                  <td colSpan="4" className="workspace-table-empty" style={{ textAlign: 'center', padding: '40px', color: '#8e9ba8' }}>
                    No hay pagos registrados en tu historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}
