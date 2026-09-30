import React, { useCallback, useEffect, useState } from 'react';
import { Notice } from './Notifications';
import { api } from '../lib/api';

export default function ProgressLog({ assignment, client = false, onClose }) {
  const [rows, setRows] = useState([]);
  const [text, setText] = useState('');
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [validationError, setValidationError] = useState('');

  const url = `/${client ? 'cliente' : 'deportivo'}/asignaciones/${assignment.id_asignacion}/seguimiento`;

  const refresh = useCallback(() => {
    api(url)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message));
  }, [url]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError('');
    setSuccess('');

    const trimmed = text.trim();
    if (!trimmed) {
      setValidationError('Por favor ingresa una observación o comentario sobre el progreso.');
      return;
    }

    if (trimmed.length > 5000) {
      setValidationError('Las observaciones no pueden superar los 5000 caracteres.');
      return;
    }

    setBusy(true);
    try {
      await api(url, {
        method: 'POST',
        body: { observaciones: trimmed, completada: complete }
      });
      setText('');
      setComplete(false);
      setSuccess('Registro de seguimiento guardado exitosamente.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Error al guardar el seguimiento.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{
      background: '#10161e',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '28px',
      marginTop: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div>
          <span style={{
            color: '#00d4ff',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            BITÁCORA Y EVOLUCIÓN
          </span>
          <h3 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '1.25rem', fontWeight: '800' }}>
            Seguimiento: {assignment.nombre}
          </h3>
          {assignment.cliente && (
            <p style={{ margin: '4px 0 0 0', color: '#8e9ba8', fontSize: '0.85rem' }}>
              Atleta: <strong style={{ color: '#fff' }}>{assignment.cliente}</strong>
            </p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#8e9ba8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8e9ba8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            ✕ Cerrar Bitácora
          </button>
        )}
      </div>

      <Notice message={error} type="error" onClose={() => setError('')} />
      <Notice message={success} type="success" onClose={() => setSuccess('')} />

      {/* Formulario para registrar nuevo seguimiento si la rutina está activa */}
      {assignment.activa ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '28px', background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nueva Entrada de Seguimiento <span style={{ color: '#ff4d4d' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: text.length > 4500 ? '#ff4d4d' : '#8e9ba8' }}>
                {text.length} / 5000 caracteres
              </span>
            </div>
            
            <textarea
              rows={3}
              aria-label="Observaciones"
              placeholder="Escribe observaciones, pesos levantados, sensaciones o feedback del entrenamiento..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (validationError) setValidationError('');
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: validationError ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                background: '#070b10',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            {validationError && (
              <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>{validationError}</span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#f5f7fb', fontSize: '0.9rem', fontWeight: '600' }}>
              <input
                type="checkbox"
                aria-label="Sesión completada"
                checked={complete}
                onChange={(e) => setComplete(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00ff88', cursor: 'pointer' }}
              />
              <span>Sesión completada</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '10px 24px',
                background: busy ? 'rgba(0, 255, 136, 0.3)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                color: '#05080c',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: busy ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 16px rgba(0, 255, 136, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              {busy ? 'Guardando…' : 'Guardar Seguimiento'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 77, 77, 0.05)',
          border: '1px solid rgba(255, 77, 77, 0.2)',
          borderRadius: '10px',
          color: '#ff9898',
          fontSize: '0.85rem',
          marginBottom: '24px'
        }}>
          ⚠️ Esta rutina está archivada. No se pueden agregar nuevas anotaciones de seguimiento.
        </div>
      )}

      {/* Historial de Registros */}
      <div>
        <h4 style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
          Historial de Entradas ({rows.length})
        </h4>

        {rows.length === 0 ? (
          <p style={{ color: '#8e9ba8', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
            Aún no hay registros de progreso para esta rutina.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rows.map((r) => (
              <div
                key={r.id_seguimiento}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 212, 255, 0.15)',
                      color: '#00d4ff',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(r.autor || 'U').charAt(0).toUpperCase()}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{r.autor}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {r.completada && (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: 'rgba(0, 255, 136, 0.15)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#00ff88',
                        fontSize: '0.72rem',
                        fontWeight: '700'
                      }}>
                        ✓ Sesión Completada
                      </span>
                    )}
                    <span style={{ color: '#8e9ba8', fontSize: '0.78rem' }}>
                      {new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(r.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#dbe4ee', fontSize: '0.92rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {r.observaciones}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
