import { useState, useEffect, useMemo, useCallback } from 'react';
import WorkspaceShell from '../../components/WorkspaceShell';
import ExerciseEditor from '../../components/ExerciseEditor';
import { Notice, useNotifications } from '../../components/Notifications';
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
  const { notify, confirm } = useNotifications();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [formErrors, setFormErrors] = useState({});
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
    if (!rutinaEditando.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (!rutinaEditando.duracion || rutinaEditando.duracion <= 0) errores.duracion = 'Requerido.';
    if (!rutinaEditando.calorias || rutinaEditando.calorias <= 0) errores.calorias = 'Requerido.';
    
    let errorEjercicios = false;
    if (!rutinaEditando.detalles || rutinaEditando.detalles.length === 0) {
      errores.general = 'Debes agregar al menos un ejercicio.';
      errorEjercicios = true;
    } else {
      rutinaEditando.detalles.forEach((ej) => {
        if (!ej.texto || !ej.texto.trim()) errorEjercicios = true;
      });
    }
    
    if (errorEjercicios) errores.ejercicios = 'Asegúrate de configurar correctamente los ejercicios.';
    
    setFormErrors(errores);
    return Object.keys(errores).length === 0;
  };

  // ==========================================
  // ACCIONES CRUD
  // ==========================================
  const handleCrear = () => {
    setRutinaEditando({
      id: null, nombre: '', grupo: 'Pecho', nivel: 'Principiante', duracion: 45, calorias: 300,
      tipoMedia: 'imagen', mediaUrl: '', 
      detalles: [{ id: Date.now(), texto: '', series: '3', repeticiones: '10', peso: 'Libre', descanso_segundos: '60' }],
    });
    setFormErrors({});
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleEditar = (rutina) => {
    setRutinaEditando(JSON.parse(JSON.stringify(rutina))); // Deep copy
    setFormErrors({});
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
    
    if (!validarFormulario()) {
      if (formErrors.ejercicios) {
        setActiveTab('ejercicios');
        notify('Por favor completa los campos de ejercicios.', 'error');
      } else if (formErrors.nombre || formErrors.duracion) {
        setActiveTab('info');
        notify('Por favor corrige los errores en Datos Base.', 'error');
      }
      return;
    }
    
    setIsSubmitting(true);
    const isNew = !rutinaEditando.id;
    const endpoint = isNew ? `${API_URL}/deportivo/rutinas` : `${API_URL}/deportivo/rutinas/${rutinaEditando.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(rutinaEditando)
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al guardar la rutina.');
      
      setModalOpen(false);
      notify('Plantilla guardada exitosamente.', 'success');
      fetchRutinas();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkspaceShell>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0' }}>Catálogo de Rutinas</h1>
          <p style={{ color: 'var(--admin-muted)', margin: 0 }}>Administra las plantillas base para tus entrenadores.</p>
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
              {[{ id: 'info', label: 'Datos Base' }, { id: 'media', label: 'Multimedia' }, { id: 'ejercicios', label: 'Ejercicios' }].map((tab) => (
                <button
                  key={tab.id} type="button"
                  style={{ 
                    background: 'none', 
                    border: activeTab === tab.id ? '1px solid #00ff88' : '1px solid transparent', 
                    padding: '10px 20px', 
                    color: activeTab === tab.id ? '#00ff88' : '#8e9ba8', 
                    fontWeight: 'bold', 
                    borderRadius: '8px',
                    cursor: 'pointer', 
                    transition: 'all 0.2s' 
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleGuardar}>
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {formErrors.general && <div style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center' }}>{formErrors.general}</div>}
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre de la rutina</label>
                    <input type="text" value={rutinaEditando.nombre} onChange={(e) => {
                      setRutinaEditando({ ...rutinaEditando, nombre: e.target.value });
                      if (formErrors.nombre) setFormErrors({...formErrors, nombre: null});
                    }} style={{ width: '100%', background: '#05080c', border: formErrors.nombre ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }} />
                    {formErrors.nombre && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{formErrors.nombre}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Grupo muscular</label>
                      <select value={rutinaEditando.grupo} onChange={(e) => setRutinaEditando({ ...rutinaEditando, grupo: e.target.value })} style={{ width: '100%', background: '#05080c', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }}>
                        {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Nivel</label>
                      <select value={rutinaEditando.nivel} onChange={(e) => setRutinaEditando({ ...rutinaEditando, nivel: e.target.value })} style={{ width: '100%', background: '#05080c', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }}>
                        {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Duración (min)</label>
                      <input type="number" min="1" value={rutinaEditando.duracion} onChange={(e) => setRutinaEditando({ ...rutinaEditando, duracion: e.target.value })} style={{ width: '100%', background: '#05080c', border: formErrors.duracion ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>Calorías Estimadas</label>
                      <input type="number" min="1" value={rutinaEditando.calorias} onChange={(e) => setRutinaEditando({ ...rutinaEditando, calorias: e.target.value })} style={{ width: '100%', background: '#05080c', border: formErrors.calorias ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>URL de Imagen/Video (Opcional)</label>
                    <input type="url" placeholder="https://..." value={rutinaEditando.mediaUrl} onChange={(e) => setRutinaEditando({ ...rutinaEditando, mediaUrl: e.target.value, tipoMedia: /\.(mp4|webm|ogg)$/i.test(e.target.value) ? 'video' : 'imagen' })} style={{ width: '100%', background: '#05080c', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', color: '#fff' }} />
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
                    onChange={detalles => setRutinaEditando({...rutinaEditando, detalles})} 
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