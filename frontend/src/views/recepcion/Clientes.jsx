import { Notice, useNotifications } from '../../components/Notifications';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/Recepcion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconPago = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Clientes = () => {
  const { notify, confirm } = useNotifications();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credential, setCredential] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: 'Activo'
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  let userName = 'Yasmidali Maricela'; 
  let userRole = 'Recepcionista';
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userName = parsedUser.nombre || 'Yasmidali Maricela';
      userRole = parsedUser.rol || parsedUser.nombre_rol || 'Recepcionista';
    } catch (e) {
      console.error('Error al leer el usuario:', e);
    }
  }
  
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Sin membresía';
    return new Date(dateValue).toISOString().slice(0, 10);
  };

  const fetchClientes = useCallback(async () => {
    if (!token) {
      setError('Sesión no encontrada.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/recepcion/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudieron cargar los clientes.');
      }

      setClientes(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const remove = async (cliente) => {
    if(!await confirm(`¿Eliminar a ${cliente.nombre}? Si tiene historial, cambia su estado a Inactivo.`, { title: 'Confirmar cambio', confirmLabel: 'Confirmar', danger: true })) return;
    try {
      const r = await fetch(`${API_URL}/recepcion/clientes/${cliente.id_usuario}`,{ method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if(!r.ok) throw new Error((await r.json()).message);
      await fetchClientes();
    } catch(e) {
      setError(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/recepcion/clientes${formData.id_usuario ? '/'+formData.id_usuario : ''}`, {
        method: formData.id_usuario ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al guardar el cliente en la base de datos.');
      }

      setIsModalOpen(false);
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'Activo' });
      fetchClientes();
      setCredential(result.temporaryPassword ? `${result.message} Contraseña temporal para ${formData.email}: ${result.temporaryPassword}` : result.message || 'Cliente guardado.');
    } catch (err) {
      console.error(err);
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda?.trim().toLowerCase() || '';
    if (!Array.isArray(clientes)) return [];
    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const id = `ED-${String(cliente.id_usuario || '').padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id.includes(texto) || nombreCompleto.includes(texto);
    });
  }, [busqueda, clientes]);

  return (
    <div className="recepcion-layout">
      <aside className="recepcion-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src="/logo-dragon.png" alt="Elder Dragon" className="brand-logo-img" />
          </div>
          <div className="brand-titles">
            <span className="brand-title-top">Elder</span>
            <span className="brand-title-bottom">Dragon Fitness</span>
          </div>
        </div>
        
        {/* Agregamos flex: 'none' para evitar que empuje lo de abajo */}
        <nav className="sidebar-nav" style={{ flex: 'none', marginBottom: '30px' }}>
          <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: 'bold', margin: '10px 0 5px 10px', display: 'block', letterSpacing: '1px' }}>
            RECEPCIÓN
          </span>
          <Link to="/recepcion/clientes" className="nav-item active">
            <IconUsers /> Directorio de Clientes
          </Link>
          <Link to="/recepcion/pagos" className="nav-item">
            <IconPago /> Control de Pagos
          </Link>
        </nav>

        {/* BLOQUE DE PERFIL (PEGADO DE INMEDIATO AL MENÚ) */}
        <div style={{ 
          paddingTop: '25px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, #51ffaa, #00d4ff)', 
            color: '#05080c', fontSize: '1.8rem', fontWeight: '900', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '15px', boxShadow: '0 8px 20px rgba(0, 212, 255, 0.2)' 
          }}>
            {userInitial}
          </div>
          
          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', textAlign: 'center', letterSpacing: '0.5px' }}>
            {userName}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#8e9ba8', margin: '0 0 25px 0', textAlign: 'center' }}>
            {userRole}
          </p>

          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', 
              background: 'rgba(255, 77, 77, 0.05)', 
              border: '1px solid rgba(255, 77, 77, 0.3)', 
              color: '#ff6b6b', fontWeight: '700', borderRadius: '12px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease' 
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = 'rgba(255, 77, 77, 0.15)'; 
              e.currentTarget.style.borderColor = '#ff4d4d'; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)'; 
              e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.3)'; 
            }}
          >
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="recepcion-content">
        <Notice message={error} onClose={() => setError('')} />
        <Notice message={credential} type="info" onClose={() => setCredential('')} />
        
        <div className="topbar-recep">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <header className="content-header">
          <div>
            <h1>Directorio de Clientes</h1>
            <p>Gestiona expedientes digitales y verifica el estado de las membresías.</p>
          </div>
          <button className="btn-recep-primary" onClick={() => { setFormData({nombre:'',apellido:'',email:'',telefono:'',estado:'Activo'}); setIsModalOpen(true); }}>
            + Nuevo Cliente
          </button>
        </header>

        <div className="panel-recep">
          <table className="recep-table">
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Plan Actual</th>
                <th>Próximo Corte</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#00ff88' }}>Cargando clientes...</td>
                </tr>
              )}
              {!loading && !error && clientesFiltrados.map(cliente => (
                <tr key={cliente.id_usuario}>
                  <td style={{ color: '#8e9ba8' }}>{`ED-${String(cliente.id_usuario).padStart(3, '0')}`}</td>
                  <td style={{ fontWeight: '700' }}>{`${cliente.nombre} ${cliente.apellido}`}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td style={{ color: '#00d4ff', fontWeight: '600' }}>{cliente.nombre_plan || 'Sin plan'}</td>
                  <td>{formatDate(cliente.fecha_fin)}</td>
                  <td>
                    <span className={`badge-estado ${(cliente.estado || '').toLowerCase()}`}>
                      {(cliente.estado || 'Sin estado').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-outline" onClick={() => { setFormData({...cliente, telefono: cliente.telefono || ''}); setIsModalOpen(true); }}>
                      Editar
                    </button>
                    <button className="btn-outline" style={{ color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }} onClick={() => remove(cliente)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !error && clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#8e9ba8' }}>No se encontraron clientes que coincidan con la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(3, 6, 10, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ 
            width: '100%', maxWidth: '560px', padding: '40px', 
            background: '#0e1520', border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' 
          }}>
            <h2 style={{ marginBottom: '30px', color: '#fff', fontSize: '1.4rem', textAlign: 'center', fontWeight: '700' }}>
              {formData.id_usuario ? 'Editar cliente' : 'Registrar nuevo cliente'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>NOMBRE</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#05080c', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor = '#6ee7b7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>APELLIDO</label>
                <input 
                  type="text" required 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#05080c', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})} 
                  onFocus={(e) => e.target.style.borderColor = '#6ee7b7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</label>
                <input 
                  type="email" required 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#05080c', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  onFocus={(e) => e.target.style.borderColor = '#6ee7b7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>TELÉFONO</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: '#05080c', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                  onFocus={(e) => e.target.style.borderColor = '#6ee7b7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8e9ba8', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#8e9ba8'}
                >
                  Cancelar
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ color: '#f5f7fb', fontSize: '0.95rem', fontWeight: '600' }}>Estado</label>
                    <select 
                      value={formData.estado || 'Activo'} 
                      onChange={e => setFormData({...formData, estado: e.target.value})}
                      style={{ background: '#05080c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Moroso">Moroso</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    style={{ padding: '12px 24px', background: '#6ee7b7', border: 'none', color: '#000', fontWeight: '800', fontSize: '0.95rem', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', opacity: isSubmitting ? 0.7 : 1 }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;