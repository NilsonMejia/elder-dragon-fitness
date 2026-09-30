import React from 'react';
import { blankExercise } from '../lib/routines';

export default function ExerciseEditor({ value = [], onChange, errors = [] }) {
  const update = (i, key, v) => {
    onChange(value.map((d, index) => (index === i ? { ...d, [key]: v } : d)));
  };

  const handleAdd = () => {
    if (value.length < 100) {
      onChange([...value, blankExercise()]);
    }
  };

  const handleRemove = (index) => {
    if (value.length > 1) {
      onChange(value.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '14px',
      padding: '20px',
      marginTop: '10px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#00ff88', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
            ⚡ EJERCICIOS DEL PLAN
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '10px',
            background: 'rgba(0, 255, 136, 0.1)',
            color: '#00ff88',
            fontWeight: '700'
          }}>
            {value.length} {value.length === 1 ? 'ejercicio' : 'ejercicios'}
          </span>
        </div>
        <span style={{ color: '#8e9ba8', fontSize: '0.75rem' }}>
          Mínimo 1 · Máximo 100
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {value.map((d, i) => {
          const rowError = errors && errors[i] ? errors[i] : null;
          return (
            <div 
              key={i} 
              style={{
                background: '#0a0f15',
                border: rowError ? '1px solid rgba(255, 77, 77, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#8e9ba8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  EJERCICIO #{i + 1}
                </span>

                <button
                  type="button"
                  disabled={value.length === 1}
                  onClick={() => handleRemove(i)}
                  title={value.length === 1 ? 'Debe haber al menos un ejercicio' : 'Quitar ejercicio'}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 77, 77, 0.3)',
                    color: value.length === 1 ? '#555' : '#ff6b6b',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: value.length === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (value.length > 1) {
                      e.currentTarget.style.background = 'rgba(255, 77, 77, 0.15)';
                      e.currentTarget.style.borderColor = '#ff4d4d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value.length > 1) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.3)';
                    }
                  }}
                >
                  ✕ Eliminar
                </button>
              </div>

              {/* Grid de campos del ejercicio */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 2fr) repeat(auto-fit, minmax(110px, 1fr))',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Nombre del Ejercicio <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Ej. Press banca inclinado"
                    value={d.texto}
                    onChange={(e) => update(i, 'texto', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: rowError?.texto ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {rowError?.texto && (
                    <span style={{ color: '#ff4d4d', fontSize: '0.72rem' }}>{rowError.texto}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Series <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ej. 4"
                    value={d.series}
                    onChange={(e) => update(i, 'series', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: rowError?.series ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {rowError?.series && (
                    <span style={{ color: '#ff4d4d', fontSize: '0.72rem' }}>{rowError.series}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Reps <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ej. 10 - 12"
                    value={d.repeticiones}
                    onChange={(e) => update(i, 'repeticiones', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: rowError?.repeticiones ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {rowError?.repeticiones && (
                    <span style={{ color: '#ff4d4d', fontSize: '0.72rem' }}>{rowError.repeticiones}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Peso
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="Ej. 50 kg / Libre"
                    value={d.peso}
                    onChange={(e) => update(i, 'peso', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Descanso (s) <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="3600"
                    placeholder="60"
                    value={d.descanso_segundos ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Math.min(3600, parseInt(e.target.value, 10) || 0));
                      update(i, 'descanso_segundos', val);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: rowError?.descanso ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {rowError?.descanso && (
                    <span style={{ color: '#ff4d4d', fontSize: '0.72rem' }}>{rowError.descanso}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          disabled={value.length >= 100}
          onClick={handleAdd}
          style={{
            padding: '10px 18px',
            background: 'rgba(0, 255, 136, 0.08)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            color: '#00ff88',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: value.length >= 100 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (value.length < 100) {
              e.currentTarget.style.background = 'rgba(0, 255, 136, 0.18)';
              e.currentTarget.style.borderColor = '#00ff88';
            }
          }}
          onMouseLeave={(e) => {
            if (value.length < 100) {
              e.currentTarget.style.background = 'rgba(0, 255, 136, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            }
          }}
        >
          + Agregar Ejercicio
        </button>
      </div>
    </div>
  );
}
