import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ExerciseEditor from '../../components/ExerciseEditor';
import ProgressLog from '../../components/ProgressLog';
import { Notice, useNotifications } from '../../components/Notifications';
import { blankExercise } from '../../lib/routines';
import { api } from '../../lib/api';

const emptyForm = () => ({
  id_cliente: '',
  id_plantilla: '',
  nombre: '',
  notas: '',
  detalles: [blankExercise()]
});

export default function Asignaciones() {
  const { notify, confirm } = useNotifications();

  // Estados de datos
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  // Estados del Formulario
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [exerciseErrors, setExerciseErrors] = useState([]);

  // Estados de Filtro y Selección
  const [selected, setSelected] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas'); // 'Todas', 'Activas', 'Archivadas'

  const progressRef = useRef(null);

  // Carga de datos iniciales
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, a] = await Promise.all([
        api('/deportivo/clientes'),
        api('/deportivo/rutinas'),
        api('/deportivo/asignaciones')
      ]);
      setClients(Array.isArray(c) ? c : []);
      setTemplates(Array.isArray(t) ? t : []);
      setRows(Array.isArray(a) ? a : []);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los datos deportivos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Manejo de cambios en el formulario
  const change = (key, v) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // Cargar ejercicios de una plantilla seleccionada
  const handleSelectTemplate = (id) => {
    if (!id) {
      setForm((f) => ({
        ...f,
        id_plantilla: '',
        nombre: f.nombre || '',
        detalles: f.detalles.length ? f.detalles : [blankExercise()]
      }));
      return;
    }

    const t = templates.find((r) => String(r.id) === String(id));
    if (t) {
      setForm((f) => ({
        ...f,
        id_plantilla: id,
        nombre: t.nombre || f.nombre,
        detalles: Array.isArray(t.detalles) && t.detalles.length
          ? t.detalles.map((d) => ({
              texto: d.texto || '',
              series: String(d.series || '3'),
              repeticiones: String(d.repeticiones || '10'),
              peso: String(d.peso || 'Libre'),
              descanso_segundos: Number(d.descanso_segundos ?? 60)
            }))
          : [blankExercise()]
      }));

      // Limpia errores relacionados
      setFormErrors((prev) => ({ ...prev, nombre: '', general: '' }));
      setExerciseErrors([]);
      notify(`Plantilla "${t.nombre}" cargada con ${t.detalles?.length || 0} ejercicios.`, 'info');
    }
  };

  // ==========================================
  // VALIDACIONES DEL FORMULARIO
  // ==========================================
  const validate = () => {
    const errors = {};
    const exErrors = [];

    // Validar cliente
    if (!form.id_cliente) {
      errors.id_cliente = 'Debes seleccionar un cliente para la asignación.';
    }

    // Validar nombre
    const trimmedNombre = form.nombre.trim();
    if (!trimmedNombre) {
      errors.nombre = 'El nombre de la rutina es obligatorio.';
    } else if (trimmedNombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder los 100 caracteres.';
    }

    // Validar notas
    if (form.notas && form.notas.length > 5000) {
      errors.notas = 'Las indicaciones no pueden superar los 5000 caracteres.';
    }

    // Validar ejercicios
    if (!form.detalles || !form.detalles.length) {
      errors.ejercicios = 'Debes agregar al menos un ejercicio.';
    } else if (form.detalles.length > 100) {
      errors.ejercicios = 'No puedes agregar más de 100 ejercicios.';
    } else {
      let hasExError = false;
      form.detalles.forEach((d, index) => {
        const itemErr = {};
        if (!d.texto || !d.texto.trim()) {
          itemErr.texto = 'Ingresa el nombre del ejercicio.';
          hasExError = true;
        } else if (d.texto.trim().length > 150) {
          itemErr.texto = 'Máximo 150 caracteres.';
          hasExError = true;
        }

        if (!d.series || !String(d.series).trim()) {
          itemErr.series = 'Series requeridas.';
          hasExError = true;
        } else if (String(d.series).length > 50) {
          itemErr.series = 'Máximo 50 caracteres.';
          hasExError = true;
        }

        if (!d.repeticiones || !String(d.repeticiones).trim()) {
          itemErr.repeticiones = 'Reps requeridas.';
          hasExError = true;
        } else if (String(d.repeticiones).length > 50) {
          itemErr.repeticiones = 'Máximo 50 caracteres.';
          hasExError = true;
        }

        const descanso = Number(d.descanso_segundos);
        if (d.descanso_segundos === '' || isNaN(descanso) || descanso < 0 || descanso > 3600) {
          itemErr.descanso = 'Entre 0 y 3600 s.';
          hasExError = true;
        }

        exErrors[index] = Object.keys(itemErr).length ? itemErr : null;
      });

      if (hasExError) {
        errors.ejercicios = 'Revisa los campos de cada ejercicio marcado en rojo.';
      }
    }

    setFormErrors(errors);
    setExerciseErrors(exErrors);
    return Object.keys(errors).length === 0;
  };

  // Guardar nueva asignación
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) {
      notify('Por favor corrige los campos marcados en rojo antes de asignar.', 'warning');
      return;
    }

    setBusy(true);
    try {
      await api('/deportivo/asignaciones', {
        method: 'POST',
        body: {
          ...form,
          nombre: form.nombre.trim(),
          detalles: form.detalles.map((d) => ({
            texto: d.texto.trim(),
            series: String(d.series).trim(),
            repeticiones: String(d.repeticiones).trim(),
            peso: String(d.peso || 'Libre').trim(),
            descanso_segundos: Number(d.descanso_segundos ?? 60)
          }))
        }
      });

      setForm(emptyForm());
      setFormErrors({});
      setExerciseErrors([]);
      setSuccess('Rutina asignada. La anterior queda en el historial.');
      notify('Rutina asignada. La anterior queda en el historial.', 'success');
      await refresh();
    } catch (err) {
      setError(err.message || 'Error al asignar la rutina.');
      notify(err.message || 'Error al asignar la rutina.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Archivar asignación
  const handleArchive = async (row) => {
    const ok = await confirm(
      `¿Deseas archivar la rutina "${row.nombre}" de ${row.cliente}? Se conservará todo su historial de seguimiento.`,
      { title: 'Archivar Asignación', confirmLabel: 'Archivar', danger: true }
    );
    if (!ok) return;

    try {
      await api(`/deportivo/asignaciones/${row.id_asignacion}/archivar`, { method: 'PATCH' });
      notify('Asignación archivada exitosamente.', 'success');
      if (selected?.id_asignacion === row.id_asignacion) {
        setSelected(null);
      }
      await refresh();
    } catch (e) {
      setError(e.message || 'Error al archivar la asignación.');
      notify(e.message, 'error');
    }
  };

  // Seleccionar asignación para ver seguimiento
  const handleOpenProgress = (assignment) => {
    setSelected(assignment);
    setTimeout(() => {
      progressRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filtrado de asignaciones
  const asignacionesFiltradas = useMemo(() => {
    return rows.filter((r) => {
      const matchTexto =
        (r.cliente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (r.nombre || '').toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado =
        filtroEstado === 'Todas'
          ? true
          : filtroEstado === 'Activas'
          ? r.activa
          : !r.activa;

      return matchTexto && matchEstado;
    });
  }, [rows, busqueda, filtroEstado]);

  // Métricas
  const kpis = useMemo(() => {
    const total = rows.length;
    const activas = rows.filter((r) => r.activa).length;
    const archivadas = total - activas;
    const clientesUnicos = new Set(rows.map((r) => r.id_cliente)).size;
    return { total, activas, archivadas, clientesUnicos };
  }, [rows]);

  return (
    <WorkspaceShell>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: '#00ff88', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ZONA TÉCNICA · ENTRENADOR
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '6px 0', color: '#fff' }}>
              Rutinas y Asignaciones
            </h1>
            <p style={{ color: '#8e9ba8', margin: 0, fontSize: '0.95rem' }}>
              Personaliza plantillas, asigna rutinas activas y registra el progreso de tus atletas.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00ff88'; e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ↻ Actualizar Datos
          </button>
        </header>

        {/* Notificaciones globales */}
        <Notice message={error} type="error" onClose={() => setError('')} />
        <Notice message={success} type="success" onClose={() => setSuccess('')} />

        {/* KPIs de Asignaciones */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#10161e', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.07)', borderLeft: '4px solid #00d4ff' }}>
            <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL ASIGNADAS</span>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00d4ff', margin: '6px 0 0 0' }}>{kpis.total}</p>
          </div>
          <div style={{ background: '#10161e', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.07)', borderLeft: '4px solid #00ff88' }}>
            <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>RUTINAS ACTIVAS</span>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#00ff88', margin: '6px 0 0 0' }}>{kpis.activas}</p>
          </div>
          <div style={{ background: '#10161e', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.07)', borderLeft: '4px solid #8e9ba8' }}>
            <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>ARCHIVADAS</span>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8e9ba8', margin: '6px 0 0 0' }}>{kpis.archivadas}</p>
          </div>
          <div style={{ background: '#10161e', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.07)', borderLeft: '4px solid #bb00ff' }}>
            <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>ATLETAS CON PLAN</span>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#bb00ff', margin: '6px 0 0 0' }}>{kpis.clientesUnicos}</p>
          </div>
        </section>

        {/* Panel 1: Formulario de Nueva Asignación */}
        <section style={{
          background: '#10161e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '36px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                ✨ Nueva Asignación de Rutina
              </h2>
              <p style={{ color: '#8e9ba8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Selecciona al atleta, parte de una plantilla base o crea una rutina personalizada desde cero.
              </p>
            </div>
            <span style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              color: '#00ff88',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}>
              Plan Personalizado
            </span>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
            
            {/* Fila: Cliente y Plantilla Base */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ATLETA / CLIENTE <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <select
                  aria-label="Cliente"
                  required
                  value={form.id_cliente}
                  onChange={(e) => change('id_cliente', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '10px',
                    border: formErrors.id_cliente ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#070b10',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecciona un cliente activo...</option>
                  {clients
                    .filter((c) => c.estado !== 'Inactivo')
                    .map((c) => (
                      <option key={c.id_usuario} value={c.id_usuario}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                </select>
                {formErrors.id_cliente && (
                  <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>
                    {formErrors.id_cliente}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  CARGAR PLANTILLA BASE (OPCIONAL)
                </label>
                <select
                  aria-label="Plantilla"
                  value={form.id_plantilla}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#070b10',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Rutina personalizada desde cero --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.grupo || 'General'} · {t.nivel || 'Todos'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nombre de la Rutina */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  NOMBRE DEL PLAN DE ENTRENAMIENTO <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: '#8e9ba8' }}>
                  {form.nombre.length} / 100
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Ej. Hipertrofia Tren Superior - Fase 1"
                value={form.nombre}
                onChange={(e) => change('nombre', e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  border: formErrors.nombre ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.nombre && (
                <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>
                  {formErrors.nombre}
                </span>
              )}
            </div>

            {/* Editor de Ejercicios */}
            <div>
              <ExerciseEditor
                value={form.detalles}
                onChange={(d) => {
                  change('detalles', d);
                  if (formErrors.ejercicios) {
                    setFormErrors((prev) => ({ ...prev, ejercicios: '' }));
                  }
                }}
                errors={exerciseErrors}
              />
              {formErrors.ejercicios && (
                <span style={{ color: '#ff4d4d', fontSize: '0.78rem', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                  ⚠️ {formErrors.ejercicios}
                </span>
              )}
            </div>

            {/* Indicaciones / Notas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  INDICACIONES, CALENTAMIENTO Y NOTAS ESPECIALES
                </label>
                <span style={{ fontSize: '0.75rem', color: '#8e9ba8' }}>
                  {form.notas.length} / 5000
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={5000}
                placeholder="Detalla pautas de calentamiento, estiramientos, rango de RPE o precauciones técnicas..."
                value={form.notas}
                onChange={(e) => change('notas', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: formErrors.notas ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.notas && (
                <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>
                  {formErrors.notas}
                </span>
              )}
            </div>

            {/* Botón de Asignar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: '13px 34px',
                  background: busy ? 'rgba(0, 255, 136, 0.3)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                  color: '#05080c',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(0, 255, 136, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {busy ? 'Asignando Plan…' : '🚀 Asignar Rutina al Atleta'}
              </button>
            </div>
          </form>
        </section>

        {/* Panel 2: Asignaciones e Historial */}
        <section style={{
          background: '#10161e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '36px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                📋 Asignaciones e Historial
              </h2>
              <p style={{ color: '#8e9ba8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Monitorea las rutinas de tus atletas y consulta sus bitácoras de entrenamiento.
              </p>
            </div>

            {/* Filtros de estado */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['Todas', 'Activas', 'Archivadas'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFiltroEstado(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: filtroEstado === st ? '#00ff88' : 'transparent',
                    color: filtroEstado === st ? '#05080c' : '#8e9ba8',
                    transition: 'all 0.2s'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar por cliente o nombre de rutina..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#070b10',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#00ff88' }}>
              <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#8e9ba8' }}>Sincronizando asignaciones...</p>
            </div>
          ) : asignacionesFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#8e9ba8' }}>
              <p style={{ fontSize: '1rem', margin: 0 }}>No se encontraron asignaciones que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr>
                    {['Atleta', 'Rutina Asignada', 'Estado', 'Ejercicios', 'Acciones'].map((title) => (
                      <th
                        key={title}
                        scope="col"
                        style={{
                          padding: '14px 16px',
                          color: '#8e9ba8',
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          fontWeight: '700'
                        }}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {asignacionesFiltradas.map((a) => {
                    const exerciseCount = Array.isArray(a.detalles) ? a.detalles.length : 0;
                    const isCurrent = selected?.id_asignacion === a.id_asignacion;

                    return (
                      <tr
                        key={a.id_asignacion}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          background: isCurrent ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                              color: '#05080c',
                              fontWeight: '900',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {(a.cliente || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                              {a.cliente}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span style={{ fontWeight: '600', color: '#fff' }}>{a.nombre}</span>
                          {a.notas && (
                            <p style={{ margin: '3px 0 0 0', color: '#8e9ba8', fontSize: '0.75rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.notas}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: a.activa ? 'rgba(0, 255, 136, 0.12)' : 'rgba(142, 155, 168, 0.12)',
                            color: a.activa ? '#00ff88' : '#8e9ba8',
                            border: a.activa ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(142, 155, 168, 0.25)'
                          }}>
                            {a.activa ? '● Activa' : 'Archivada'}
                          </span>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#00d4ff',
                            fontSize: '0.78rem',
                            fontWeight: '600'
                          }}>
                            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                          </span>
                        </td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenProgress(a)}
                              style={{
                                padding: '7px 14px',
                                background: isCurrent ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.08)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                color: '#00d4ff',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.25)'; }}
                              onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(0, 212, 255, 0.08)'; }}
                            >
                              📊 Seguimiento
                            </button>

                            {a.activa && (
                              <button
                                type="button"
                                onClick={() => handleArchive(a)}
                                style={{
                                  padding: '7px 12px',
                                  background: 'transparent',
                                  border: '1px solid rgba(255, 77, 77, 0.3)',
                                  color: '#ff6b6b',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 77, 77, 0.15)'; e.currentTarget.style.borderColor = '#ff4d4d'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.3)'; }}
                              >
                                Archivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sección de Seguimiento / Bitácora seleccionada */}
        <div ref={progressRef}>
          {selected && (
            <ProgressLog
              key={selected.id_asignacion}
              assignment={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </div>

      </div>
    </WorkspaceShell>
  );
}
