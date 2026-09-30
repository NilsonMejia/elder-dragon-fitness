import { useState, useEffect, useMemo, useCallback } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ExerciseEditor from '../../components/ExerciseEditor';
import { Notice, useNotifications } from '../../components/Notifications';
import { sessionUser } from '../../lib/api';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// =========================================================
// ICONOS SVG
// =========================================================
const Icon = ({ path, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{path}</svg>
);
const IconSearch   = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />;
const IconEdit     = (p) => <Icon {...p} path={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>} />;
const IconTrash    = (p) => <Icon {...p} path={<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>} />;
const IconClose    = (p) => <Icon {...p} path={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />;
const IconClock    = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />;
const IconFire     = (p) => <Icon {...p} path={<><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></>} />;
const IconLevel    = (p) => <Icon {...p} path={<><line x1="4" y1="20" x2="4" y2="14" /><line x1="10" y1="20" x2="10" y2="10" /><line x1="16" y1="20" x2="16" y2="4" /><line x1="22" y1="20" x2="22" y2="12" /></>} />;
const IconTarget   = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>} />;
const IconImage    = (p) => <Icon {...p} path={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>} />;
const IconWarning  = (p) => <Icon {...p} path={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} />;

const GRUPOS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio', 'Full Body'];
const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'];

const Rutinas = () => {
  const user = sessionUser();
  const { notify, confirm } = useNotifications();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [exerciseErrors, setExerciseErrors] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchRutinas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/deportivo/rutinas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar las rutinas.');
      const data = await response.json();
      setRutinas(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRutinas();
  }, [fetchRutinas]);

  const stats = useMemo(() => ({
    total: rutinas.length,
    principiantes: rutinas.filter(r => r.nivel === 'Principiante').length,
    intermedios: rutinas.filter(r => r.nivel === 'Intermedio').length,
    avanzados: rutinas.filter(r => r.nivel === 'Avanzado').length,
  }), [rutinas]);

  const rutinasFiltradas = useMemo(() => {
    return rutinas.filter((r) => {
      const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchGrupo = filtroGrupo === 'Todos' || r.grupo === filtroGrupo;
      const matchNivel = filtroNivel === 'Todos' || r.nivel === filtroNivel;
      return matchBusqueda && matchGrupo && matchNivel;
    });
  }, [rutinas, busqueda, filtroGrupo, filtroNivel]);

  // ==========================================
  // VALIDACIONES
  // ==========================================
  const validarFormulario = () => {
    const errores = {};
    const exErrors = [];

    // Validar nombre
    const nombre = (rutinaEditando.nombre || '').trim();
    if (!nombre) {
      errores.nombre = 'El nombre de la rutina es obligatorio.';
    } else if (nombre.length > 100) {
      errores.nombre = 'El nombre no puede superar los 100 caracteres.';
    }

    // Validar duracion
    const duracion = Number(rutinaEditando.duracion);
    if (!rutinaEditando.duracion || isNaN(duracion) || !Number.isInteger(duracion) || duracion <= 0) {
      errores.duracion = 'Ingresa una duración válida en minutos (> 0).';
    } else if (duracion > 480) {
      errores.duracion = 'La duración máxima permitida es de 480 minutos.';
    }

    // Validar calorias
    const calorias = Number(rutinaEditando.calorias);
    if (!rutinaEditando.calorias || isNaN(calorias) || !Number.isInteger(calorias) || calorias <= 0) {
      errores.calorias = 'Ingresa una estimación calórica válida (> 0).';
    } else if (calorias > 5000) {
      errores.calorias = 'Las calorías estimadas no pueden superar 5000 kcal.';
    }

    // Validar mediaUrl opcional
    if (rutinaEditando.mediaUrl && rutinaEditando.mediaUrl.trim().length > 1000) {
      errores.mediaUrl = 'La URL es demasiado extensa (máx. 1000 caracteres).';
    }

    // Validar ejercicios
    const detalles = rutinaEditando.detalles;
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      errores.general = 'Debes agregar al menos un ejercicio a la plantilla.';
      errores.ejercicios = 'Debes agregar al menos un ejercicio.';
    } else if (detalles.length > 100) {
      errores.ejercicios = 'No puedes agregar más de 100 ejercicios.';
    } else {
      let hasExError = false;
      detalles.forEach((ej, index) => {
        const itemErr = {};
        const texto = (ej.texto || '').trim();
        if (!texto) {
          itemErr.texto = 'Nombre del ejercicio requerido.';
          hasExError = true;
        } else if (texto.length > 150) {
          itemErr.texto = 'Máximo 150 caracteres.';
          hasExError = true;
        }

        const series = String(ej.series ?? '').trim();
        if (!series) {
          itemErr.series = 'Series requeridas.';
          hasExError = true;
        } else if (series.length > 50) {
          itemErr.series = 'Máx. 50 caracteres.';
          hasExError = true;
        }

        const reps = String(ej.repeticiones ?? '').trim();
        if (!reps) {
          itemErr.repeticiones = 'Reps requeridas.';
          hasExError = true;
        } else if (reps.length > 50) {
          itemErr.repeticiones = 'Máx. 50 caracteres.';
          hasExError = true;
        }

        const descanso = Number(ej.descanso_segundos);
        if (ej.descanso_segundos === '' || isNaN(descanso) || !Number.isInteger(descanso) || descanso < 0 || descanso > 3600) {
          itemErr.descanso = 'Entre 0 y 3600 s.';
          hasExError = true;
        }

        exErrors[index] = Object.keys(itemErr).length ? itemErr : null;
      });

      if (hasExError) {
        errores.ejercicios = 'Revisa los campos de cada ejercicio marcado en rojo.';
      }
    }

    setFormErrors(errores);
    setExerciseErrors(exErrors);
    return {
      isValid: Object.keys(errores).length === 0,
      errors: errores,
      exErrors
    };
  };

  // ==========================================
  // ACCIONES CRUD
  // ==========================================
  const handleCrear = () => {
    setRutinaEditando({
      id: null,
      nombre: '',
      grupo: 'Pecho',
      nivel: 'Principiante',
      duracion: 45,
      calorias: 300,
      tipoMedia: 'imagen',
      mediaUrl: '',
      detalles: [{ id: Date.now(), texto: '', series: '3', repeticiones: '10', peso: 'Libre', descanso_segundos: '60' }],
    });
    setFormErrors({});
    setExerciseErrors([]);
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleEditar = (rutina) => {
    setRutinaEditando(JSON.parse(JSON.stringify(rutina))); // Deep copy
    setFormErrors({});
    setExerciseErrors([]);
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    if (!await confirm('¿Estás seguro de eliminar esta plantilla del catálogo?', { title: 'Eliminar plantilla', confirmLabel: 'Eliminar', danger: true })) return;
    try {
      const response = await fetch(`${API_URL}/deportivo/rutinas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar la rutina.');
      notify('Plantilla eliminada.', 'success');
      fetchRutinas();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validarFormulario();
    if (!isValid) {
      if (validationErrors.nombre || validationErrors.duracion || validationErrors.calorias) {
        setActiveTab('info');
        notify('Por favor corrige los datos base marcados en rojo.', 'warning');
      } else if (validationErrors.ejercicios) {
        setActiveTab('ejercicios');
        notify('Por favor completa los ejercicios requeridos marcados en rojo.', 'warning');
      } else if (validationErrors.mediaUrl) {
        setActiveTab('media');
        notify(validationErrors.mediaUrl, 'warning');
      } else {
        notify('Por favor completa los campos obligatorios.', 'warning');
      }
      return;
    }
    
    setIsSubmitting(true);
    const isNew = !rutinaEditando.id;
    const endpoint = isNew ? `${API_URL}/deportivo/rutinas` : `${API_URL}/deportivo/rutinas/${rutinaEditando.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      nombre: rutinaEditando.nombre.trim(),
      grupo: rutinaEditando.grupo,
      nivel: rutinaEditando.nivel,
      duracion: parseInt(rutinaEditando.duracion, 10),
      calorias: parseInt(rutinaEditando.calorias, 10),
      tipoMedia: rutinaEditando.tipoMedia || 'imagen',
      mediaUrl: (rutinaEditando.mediaUrl || '').trim(),
      detalles: (rutinaEditando.detalles || []).map((d) => ({
        texto: (d.texto || '').trim(),
        series: String(d.series ?? '').trim(),
        repeticiones: String(d.repeticiones ?? '').trim(),
        peso: String(d.peso ?? 'Libre').trim(),
        descanso_segundos: Number(d.descanso_segundos ?? 60)
      }))
    };
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al guardar la rutina.');
      }
      
      setModalOpen(false);
      notify(isNew ? 'Plantilla creada exitosamente.' : 'Plantilla actualizada exitosamente.', 'success');
      fetchRutinas();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkspaceShell>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0' }}>Catálogo de Rutinas</h1>
          <p style={{ color: 'var(--admin-muted)', margin: 0 }}>
            {user?.rol === 'Entrenador' 
              ? 'Explora y administra las plantillas base para asignar a tus atletas.' 
              : 'Administra las plantillas base para tus entrenadores.'}
          </p>
        </div>
        <button className="admin-btn-primary" onClick={handleCrear}>
          + Crear Rutina Base
        </button>
      </header>

      <Notice message={error} />

      <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'var(--admin-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--admin-border)', borderTop: '3px solid #00d4ff' }}>
          <div className="stat-head" style={{ display: 'flex', gap: '10px', color: 'var(--admin-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}><IconTarget size={18} /> TOTAL PLANTILLAS</div>
          <p style={{ fontSize: '1.9rem', fontWeight: 800, color: '#00d4ff', margin: 0 }}>{stats.total}</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--admin-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--admin-border)', borderTop: '3px solid #00ff88' }}>
          <div className="stat-head" style={{ display: 'flex', gap: '10px', color: 'var(--admin-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}><IconLevel size={18} /> PRINCIPIANTES</div>
          <p style={{ fontSize: '1.9rem', fontWeight: 800, color: '#00ff88', margin: 0 }}>{stats.principiantes}</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--admin-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--admin-border)', borderTop: '3px solid #bb00ff' }}>
          <div className="stat-head" style={{ display: 'flex', gap: '10px', color: 'var(--admin-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}><IconLevel size={18} /> INTERMEDIOS</div>
          <p style={{ fontSize: '1.9rem', fontWeight: 800, color: '#bb00ff', margin: 0 }}>{stats.intermedios}</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--admin-card)', padding: '22px', borderRadius: '16px', border: '1px solid var(--admin-border)', borderTop: '3px solid #ff4d4d' }}>
          <div className="stat-head" style={{ display: 'flex', gap: '10px', color: 'var(--admin-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}><IconFire size={18} /> AVANZADOS</div>
          <p style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ff4d4d', margin: 0 }}>{stats.avanzados}</p>
        </div>
      </section>

      {/* FILTROS BLOQUEADOS CONTRA DISTORSIÓN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '15px', marginBottom: '30px', background: 'var(--admin-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--admin-border)', alignItems: 'end' }}>
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>BUSCAR RUTINA</label>
          <span style={{ position: 'absolute', left: '14px', bottom: '12px', color: 'var(--admin-muted)' }}><IconSearch size={16} /></span>
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', background: '#0b1016', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px 12px 42px', borderRadius: '10px', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>GRUPO MUSCULAR</label>
          <select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} style={{ background: '#0b1016', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', minWidth: '180px' }}>
            <option value="Todos">Todos los grupos</option>
            {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>NIVEL</label>
          <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} style={{ background: '#0b1016', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', minWidth: '180px' }}>
            <option value="Todos">Todos los niveles</option>
            {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#00ff88' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,255,136,0.15)', borderLeftColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : rutinasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--admin-card)', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
          <IconSearch size={40} color="#4d5b6b" />
          <p style={{ marginTop: '15px', color: 'var(--admin-muted)', fontSize: '1.1rem' }}>No se encontraron rutinas.</p>
        </div>
      ) : (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {rutinasFiltradas.map((rutina) => (
            <article key={rutina.id} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ position: 'relative', height: '180px', flexShrink: 0, width: '100%', background: '#05080c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {rutina.mediaUrl ? (
                  rutina.tipoMedia === 'video' ? (
                    <video src={rutina.mediaUrl} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  ) : (
                    <img src={rutina.mediaUrl} alt={rutina.nombre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  )
                ) : (
                  <div style={{ color: '#4d5b6b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <IconImage size={32} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{rutina.grupo}</span>
                  </div>
                )}
                
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditar(rutina)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#00ff88', backdropFilter: 'blur(4px)' }}>
                    <IconEdit size={16} />
                  </button>
                  <button onClick={() => handleEliminar(rutina.id)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#ff4d4d', backdropFilter: 'blur(4px)' }}>
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 12px 0', color: '#fff' }}>{rutina.nombre}</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(0,212,255,0.2)' }}>{rutina.grupo}</span>
                  <span style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(0,255,136,0.2)' }}>{rutina.nivel}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconClock size={14}/> {rutina.duracion} min</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconFire size={14}/> {rutina.calorias} kcal</span>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: 'auto' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Ejercicios ({rutina.detalles?.length || 0})</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    {(rutina.detalles || []).slice(0, 3).map((d) => (
                      <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>• {d.texto}</span>
                        <span style={{ color: '#00ff88', fontWeight: 600, flexShrink: 0 }}>{d.series}x{d.repeticiones}</span>
                      </li>
                    ))}
                    {(rutina.detalles || []).length > 3 && (
                      <li style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '4px', fontWeight: 600 }}>+ {(rutina.detalles || []).length - 3} ejercicios más</li>
                    )}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* MODAL MANTENIDO CON ESTILO OSCURO */}
      {modalOpen && rutinaEditando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '800px', padding: '35px', maxHeight: '90vh', overflowY: 'auto', background: '#10161e', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', textAlign: 'center', width: '100%' }}>
                {rutinaEditando.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '8px', position: 'absolute', right: '35px' }}>
                <IconClose size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
              {[
                { id: 'info', label: 'Datos Base', hasError: !!(formErrors.nombre || formErrors.duracion || formErrors.calorias) },
                { id: 'media', label: 'Multimedia', hasError: !!formErrors.mediaUrl },
                { id: 'ejercicios', label: 'Ejercicios', hasError: !!(formErrors.ejercicios || exerciseErrors.some(Boolean)) }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  style={{ 
                    background: activeTab === tab.id ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.03)', 
                    border: activeTab === tab.id ? '1px solid #00ff88' : tab.hasError ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)', 
                    padding: '10px 20px', 
                    color: activeTab === tab.id ? '#00ff88' : tab.hasError ? '#ff6b6b' : '#8e9ba8', 
                    fontWeight: 'bold', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  {tab.hasError && (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d' }} title="Tiene campos con errores" />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleGuardar} noValidate>
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {formErrors.general && (
                    <div style={{ color: '#ff4d4d', fontSize: '0.88rem', textAlign: 'center', background: 'rgba(255,77,77,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.3)' }}>
                      {formErrors.general}
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Nombre de la rutina <span style={{ color: '#ff4d4d' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      maxLength={100}
                      placeholder="Ej. Hipertrofia Tren Superior"
                      value={rutinaEditando.nombre} 
                      onChange={(e) => {
                        setRutinaEditando({ ...rutinaEditando, nombre: e.target.value });
                        if (formErrors.nombre) setFormErrors({ ...formErrors, nombre: null });
                      }} 
                      style={{ 
                        width: '100%', 
                        background: '#05080c', 
                        border: formErrors.nombre ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', 
                        padding: '12px 16px', 
                        borderRadius: '10px', 
                        color: '#fff',
                        boxSizing: 'border-box'
                      }} 
                    />
                    {formErrors.nombre && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{formErrors.nombre}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Grupo muscular</label>
                      <select 
                        value={rutinaEditando.grupo} 
                        onChange={(e) => setRutinaEditando({ ...rutinaEditando, grupo: e.target.value })} 
                        style={{ width: '100%', background: '#05080c', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                      >
                        {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Nivel</label>
                      <select 
                        value={rutinaEditando.nivel} 
                        onChange={(e) => setRutinaEditando({ ...rutinaEditando, nivel: e.target.value })} 
                        style={{ width: '100%', background: '#05080c', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }}
                      >
                        {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Duración (min) <span style={{ color: '#ff4d4d' }}>*</span>
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        max="480"
                        placeholder="45"
                        value={rutinaEditando.duracion ?? ''} 
                        onChange={(e) => {
                          setRutinaEditando({ ...rutinaEditando, duracion: e.target.value });
                          if (formErrors.duracion) setFormErrors({ ...formErrors, duracion: null });
                        }} 
                        style={{ 
                          width: '100%', 
                          background: '#05080c', 
                          border: formErrors.duracion ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', 
                          padding: '12px 16px', 
                          borderRadius: '10px', 
                          color: '#fff',
                          boxSizing: 'border-box'
                        }} 
                      />
                      {formErrors.duracion && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{formErrors.duracion}</span>}
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Calorías Estimadas <span style={{ color: '#ff4d4d' }}>*</span>
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        max="5000"
                        placeholder="300"
                        value={rutinaEditando.calorias ?? ''} 
                        onChange={(e) => {
                          setRutinaEditando({ ...rutinaEditando, calorias: e.target.value });
                          if (formErrors.calorias) setFormErrors({ ...formErrors, calorias: null });
                        }} 
                        style={{ 
                          width: '100%', 
                          background: '#05080c', 
                          border: formErrors.calorias ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', 
                          padding: '12px 16px', 
                          borderRadius: '10px', 
                          color: '#fff',
                          boxSizing: 'border-box'
                        }} 
                      />
                      {formErrors.calorias && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{formErrors.calorias}</span>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      URL de Imagen/Video (Opcional)
                    </label>
                    <input 
                      type="url" 
                      maxLength={1000}
                      placeholder="https://..." 
                      value={rutinaEditando.mediaUrl || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setRutinaEditando({ ...rutinaEditando, mediaUrl: val, tipoMedia: /\.(mp4|webm|ogg)$/i.test(val) ? 'video' : 'imagen' });
                        if (formErrors.mediaUrl) setFormErrors({ ...formErrors, mediaUrl: null });
                      }} 
                      style={{ 
                        width: '100%', 
                        background: '#05080c', 
                        border: formErrors.mediaUrl ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', 
                        padding: '12px 16px', 
                        borderRadius: '10px', 
                        color: '#fff',
                        boxSizing: 'border-box'
                      }} 
                    />
                    {formErrors.mediaUrl && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{formErrors.mediaUrl}</span>}
                  </div>
                  <div style={{ height: '220px', background: '#05080c', border: '1px dashed var(--admin-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {rutinaEditando.mediaUrl ? (
                        rutinaEditando.tipoMedia === 'video' ? <video src={rutinaEditando.mediaUrl} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={rutinaEditando.mediaUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <div style={{ color: 'var(--admin-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <IconImage size={40} />
                          <span>Sin imagen asignada</span>
                        </div>
                     )}
                  </div>
                </div>
              )}

              {activeTab === 'ejercicios' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <ExerciseEditor 
                    value={rutinaEditando.detalles || []} 
                    onChange={detalles => {
                      setRutinaEditando({...rutinaEditando, detalles});
                      if (formErrors.ejercicios) {
                        setFormErrors(prev => ({ ...prev, ejercicios: null, general: null }));
                      }
                    }} 
                    errors={exerciseErrors}
                  />
                  {formErrors.ejercicios && (
                    <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconWarning size={14} /> {formErrors.ejercicios}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '35px' }}>
                <button type="button" style={{ background: '#10161e', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '200px' }} onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ background: 'linear-gradient(90deg, #51ffaa, #00d4ff)', border: 'none', color: '#000', padding: '12px 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '200px', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};

export default Rutinas;