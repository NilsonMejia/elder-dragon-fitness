import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminPageShell } from './Dashboard';
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

const GRUPOS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio', 'Full Body'];
const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'];

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [rutinaEditando, setRutinaEditando] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // ==========================================
  // FETCH DESDE LA API
  // ==========================================
  const fetchRutinas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/rutinas`, {
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

  // ==========================================
  // ESTADÍSTICAS Y FILTROS
  // ==========================================
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
  // ACCIONES CRUD
  // ==========================================
  const handleCrear = () => {
    setRutinaEditando({
      id: null, nombre: '', grupo: 'Pecho', nivel: 'Principiante', duracion: 45, calorias: 300,
      tipoMedia: 'imagen', mediaUrl: '', detalles: [{ id: Date.now(), texto: '', series: '', peso: '' }],
    });
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleEditar = (rutina) => {
    setRutinaEditando(JSON.parse(JSON.stringify(rutina))); // Deep copy
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla del catálogo?')) return;
    try {
      const response = await fetch(`${API_URL}/admin/rutinas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar la rutina.');
      fetchRutinas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!rutinaEditando.nombre.trim()) return;
    setIsSubmitting(true);

    const isNew = !rutinaEditando.id;
    const endpoint = isNew ? `${API_URL}/admin/rutinas` : `${API_URL}/admin/rutinas/${rutinaEditando.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(rutinaEditando)
      });
      if (!response.ok) throw new Error('Error al guardar la rutina.');
      
      setModalOpen(false);
      fetchRutinas();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageShell>
      <header className="content-header">
        <div>
          <h1>Catálogo de Rutinas</h1>
          <p>Administra las plantillas base desde PostgreSQL para tus entrenadores.</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn-primary" onClick={handleCrear}>
            + Crear Rutina Base
          </button>
        </div>
      </header>

      {error && <div style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}

      <section className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card tone-blue">
          <div className="stat-head"><span className="stat-icon"><IconTarget size={18} /></span> <span className="stat-label">Total Plantillas</span></div>
          <p className="stat-value text-blue">{stats.total}</p>
        </div>
        <div className="stat-card tone-green">
          <div className="stat-head"><span className="stat-icon"><IconLevel size={18} /></span> <span className="stat-label">Principiantes</span></div>
          <p className="stat-value text-green">{stats.principiantes}</p>
        </div>
        <div className="stat-card tone-purple">
          <div className="stat-head"><span className="stat-icon"><IconLevel size={18} /></span> <span className="stat-label">Intermedios</span></div>
          <p className="stat-value text-purple">{stats.intermedios}</p>
        </div>
        <div className="stat-card tone-red">
          <div className="stat-head"><span className="stat-icon"><IconFire size={18} /></span> <span className="stat-label">Avanzados</span></div>
          <p className="stat-value text-red">{stats.avanzados}</p>
        </div>
      </section>

      <div className="report-filters" style={{ display: 'flex', gap: '20px', marginBottom: '30px', background: 'var(--admin-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
        <div className="filter-group" style={{ flex: 2 }}>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>BUSCAR</label>
          <div className="topbar-search" style={{ maxWidth: '100%' }}>
            <span className="search-icon"><IconSearch size={16} /></span>
            <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>
        <div className="filter-group" style={{ flex: 1 }}>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>GRUPO MUSCULAR</label>
          <select className="admin-input" value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
            <option value="Todos">Todos</option>
            {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group" style={{ flex: 1 }}>
          <label style={{ display: 'block', color: 'var(--admin-muted)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>NIVEL</label>
          <select className="admin-input" value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
            <option value="Todos">Todos</option>
            {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#00ff88' }}>
          <div className="spinner"></div>
          <p>Cargando catálogo desde la base de datos...</p>
        </div>
      ) : rutinasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8e9ba8' }}>
          <IconSearch size={32} />
          <p style={{ marginTop: '10px' }}>No se encontraron rutinas en el catálogo.</p>
        </div>
      ) : (
        <section className="planes-grid">
          {rutinasFiltradas.map((rutina) => (
            <article key={rutina.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                {rutina.tipoMedia === 'video' ? (
                  <video src={rutina.mediaUrl} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={rutina.mediaUrl} alt={rutina.nombre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button className="admin-btn-secondary" style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: 'none' }} onClick={() => handleEditar(rutina)} title="Editar">
                    <IconEdit size={16} color="#00ff88" />
                  </button>
                  <button className="admin-btn-secondary" style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: 'none' }} onClick={() => handleEliminar(rutina.id)} title="Eliminar">
                    <IconTrash size={16} color="#ff4d4d" />
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{rutina.nombre}</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <span className="badge-status active">{rutina.grupo}</span>
                  <span className="badge-rol admin">{rutina.nivel}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '15px' }}>
                  <span><IconClock size={12}/> {rutina.duracion} min</span>
                  <span><IconFire size={12}/> {rutina.calorias} kcal</span>
                </div>
                <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '15px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Ejercicios ({rutina.detalles.length})</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                    {rutina.detalles.slice(0, 3).map((d) => (
                      <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {d.texto}</span>
                        <span style={{ color: '#00ff88' }}>{d.series}</span>
                      </li>
                    ))}
                    {rutina.detalles.length > 3 && (
                      <li style={{ textAlign: 'center', fontSize: '0.8rem' }}>+ {rutina.detalles.length - 3} más...</li>
                    )}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {modalOpen && rutinaEditando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '100%', maxWidth: '600px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#fff' }}>{rutinaEditando.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
              <button className="btn-edit" style={{ border: 'none' }} onClick={() => setModalOpen(false)}>
                <IconClose size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
              {[{ id: 'info', label: 'Datos Base' }, { id: 'media', label: 'Multimedia' }, { id: 'ejercicios', label: 'Ejercicios' }].map((tab) => (
                <button
                  key={tab.id} type="button"
                  style={{ background: 'none', border: 'none', padding: '5px 15px', color: activeTab === tab.id ? '#00ff88' : '#8e9ba8', fontWeight: 'bold', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #00ff88' : 'none' }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleGuardar}>
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Nombre de la rutina</label>
                    <input className="admin-input" type="text" value={rutinaEditando.nombre} onChange={(e) => setRutinaEditando({ ...rutinaEditando, nombre: e.target.value })} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label>Grupo muscular</label>
                      <select className="admin-input" value={rutinaEditando.grupo} onChange={(e) => setRutinaEditando({ ...rutinaEditando, grupo: e.target.value })}>
                        {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label>Nivel</label>
                      <select className="admin-input" value={rutinaEditando.nivel} onChange={(e) => setRutinaEditando({ ...rutinaEditando, nivel: e.target.value })}>
                        {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label>Duración (min)</label>
                      <input className="admin-input" type="number" min="0" value={rutinaEditando.duracion} onChange={(e) => setRutinaEditando({ ...rutinaEditando, duracion: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label>Calorías Estimadas</label>
                      <input className="admin-input" type="number" min="0" value={rutinaEditando.calorias} onChange={(e) => setRutinaEditando({ ...rutinaEditando, calorias: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>URL de Imagen/Video</label>
                    <input className="admin-input" type="url" placeholder="https://..." value={rutinaEditando.mediaUrl} onChange={(e) => setRutinaEditando({ ...rutinaEditando, mediaUrl: e.target.value, tipoMedia: /\.(mp4|webm|ogg)$/i.test(e.target.value) ? 'video' : 'imagen' })} />
                  </div>
                  <div style={{ height: '200px', background: '#05080c', border: '1px dashed #8e9ba8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {rutinaEditando.mediaUrl ? (
                        rutinaEditando.tipoMedia === 'video' ? <video src={rutinaEditando.mediaUrl} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={rutinaEditando.mediaUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <p style={{ color: '#8e9ba8' }}>Vista previa multimedia</p>
                     )}
                  </div>
                </div>
              )}

              {activeTab === 'ejercicios' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {rutinaEditando.detalles.map((detalle, index) => (
                    <div key={detalle.id || index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                      <input className="admin-input" type="text" value={detalle.texto} placeholder="Nombre del ejercicio" onChange={(e) => {
                        const nuevos = [...rutinaEditando.detalles];
                        nuevos[index] = { ...nuevos[index], texto: e.target.value };
                        setRutinaEditando({ ...rutinaEditando, detalles: nuevos });
                      }} />
                      <input className="admin-input" type="text" value={detalle.series} placeholder="Ej: 4x10" onChange={(e) => {
                        const nuevos = [...rutinaEditando.detalles];
                        nuevos[index] = { ...nuevos[index], series: e.target.value };
                        setRutinaEditando({ ...rutinaEditando, detalles: nuevos });
                      }} />
                      <input className="admin-input" type="text" value={detalle.peso} placeholder="Ej: Libre" onChange={(e) => {
                        const nuevos = [...rutinaEditando.detalles];
                        nuevos[index] = { ...nuevos[index], peso: e.target.value };
                        setRutinaEditando({ ...rutinaEditando, detalles: nuevos });
                      }} />
                      <button type="button" className="btn-edit" onClick={() => {
                        const nuevos = rutinaEditando.detalles.filter((_, i) => i !== index);
                        setRutinaEditando({ ...rutinaEditando, detalles: nuevos });
                      }}><IconTrash size={16} color="#ff4d4d" /></button>
                    </div>
                  ))}
                  <button type="button" className="admin-btn-secondary" style={{ marginTop: '10px' }} onClick={() => setRutinaEditando({
                    ...rutinaEditando, detalles: [...rutinaEditando.detalles, { id: Date.now(), texto: '', series: '', peso: '' }]
                  })}>
                    + Añadir Ejercicio
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="button" className="admin-btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default Rutinas;