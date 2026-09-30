import React, { useEffect, useState, useCallback } from 'react';
import { Notice, useNotifications } from '../../components/Notifications';
import WorkspaceShell from '../../components/WorkspaceShell';
import ProgressLog from '../../components/ProgressLog';
import { api } from '../../lib/api';

export default function MiRutina() {
  const { notify } = useNotifications();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchRoutine = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await api('/cliente/rutina');
      setRoutine(data);
      if (isManual) {
        notify('Plan de entrenamiento actualizado.', 'info');
      }
    } catch (e) {
      setError(e.message || 'Error al cargar tu rutina.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchRoutine();
  }, [fetchRoutine]);

  return (
    <WorkspaceShell>
      <header className="content-header workspace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="workspace-eyebrow" style={{ color: '#00ff88', fontWeight: '800', letterSpacing: '1px' }}>MI ENTRENAMIENTO</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0', color: '#fff' }}>Mi rutina</h1>
          <p style={{ color: '#8e9ba8', margin: 0 }}>Tu plan de entrenamiento personalizado y bitácora de evolución.</p>
        </div>
        {routine && (
          <button
            type="button"
            onClick={() => fetchRoutine(true)}
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
            <span>↻</span> {refreshing ? 'Actualizando...' : 'Recargar Rutina'}
          </button>
        )}
      </header>

      <Notice message={error} onClose={() => setError('')} />

      {loading && (
        <section className="panel workspace-empty" role="status" style={{ textAlign: 'center', padding: '60px 20px', background: '#10161e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#8e9ba8', fontSize: '1.1rem' }}>Cargando tu plan de entrenamiento…</p>
        </section>
      )}

      {!loading && !error && !routine && (
        <section className="panel workspace-empty" style={{ textAlign: 'center', padding: '60px 20px', background: '#10161e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="workspace-empty-icon" aria-hidden="true" style={{ marginBottom: '16px', color: '#00ff88' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="m6 6 12 12M3 9l6-6M15 21l6-6M2 6l4-4M18 22l4-4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
            Tu próximo entrenamiento empieza aquí
          </h2>
          <p style={{ color: '#8e9ba8', margin: '0 0 16px 0', fontSize: '0.95rem' }}>
            Aún no tienes una rutina asignada. Consulta con tu entrenador para que arme tu plan.
          </p>
          <span className="workspace-empty-hint" style={{ fontSize: '0.85rem', color: '#00d4ff', background: 'rgba(0,212,255,0.1)', padding: '6px 14px', borderRadius: '20px', display: 'inline-block' }}>
            Cuando esté lista, podrás ver tus ejercicios y registrar tu progreso.
          </span>
        </section>
      )}

      {routine && (
        <>
          {/* Tarjetas informativas de la rutina */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #00ff88' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>RUTINA ACTIVA</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 2px', color: '#00ff88', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {routine.nombre}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#8e9ba8' }}>Asignada a tu cuenta</span>
            </div>

            <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #00d4ff' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>ENTRENADOR</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 2px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {routine.entrenador || 'Asignado'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#00d4ff' }}>Responsable de tu plan</span>
            </div>

            <div style={{ background: '#10161e', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', borderTop: '3px solid #bb00ff' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8e9ba8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>EJERCICIOS</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 2px', color: '#fff' }}>
                {routine.detalles?.length || 0}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#8e9ba8' }}>En este circuito</span>
            </div>
          </div>

          <section className="panel" style={{ background: '#10161e', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="workspace-panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="workspace-eyebrow" style={{ color: '#00d4ff', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px' }}>RUTINA ACTUAL</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '4px 0 6px 0' }}>{routine.nombre}</h2>
                <p style={{ color: '#8e9ba8', margin: 0, fontSize: '0.9rem' }}>Entrenador: {routine.entrenador}</p>
              </div>
              <span className="workspace-count" style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', fontWeight: 800, fontSize: '0.8rem', border: '1px solid rgba(0, 255, 136, 0.25)' }}>
                {routine.detalles.length} ejercicios
              </span>
            </div>

            {routine.notas && (
              <div style={{ padding: '14px 18px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  📌 Indicaciones de tu entrenador:
                </span>
                <p className="workspace-notes" style={{ color: '#dbe4ee', fontSize: '0.92rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {routine.notas}
                </p>
              </div>
            )}

            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th>Series</th>
                    <th>Repeticiones</th>
                    <th>Peso</th>
                    <th>Descanso</th>
                  </tr>
                </thead>
                <tbody>
                  {routine.detalles.map((d, i) => (
                    <tr key={i}>
                      <td style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', color: '#8e9ba8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          {i + 1}
                        </span>
                        {d.texto}
                      </td>
                      <td>
                        <span style={{ color: '#00ff88', fontWeight: 700 }}>{d.series}</span>
                      </td>
                      <td>
                        <span style={{ color: '#00d4ff', fontWeight: 700 }}>{d.repeticiones}</span>
                      </td>
                      <td style={{ color: '#e2e8f0' }}>{d.peso || 'Libre'}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: '#8e9ba8', fontSize: '0.8rem', fontWeight: 600 }}>
                          ⏱ {d.descanso_segundos} s
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <ProgressLog assignment={routine} client />
        </>
      )}
    </WorkspaceShell>
  );
}
