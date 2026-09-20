import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/Recepcion.css';
import Alerts from '../../components/Alerts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Íconos SVG limpios
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
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credential,setCredential]=useState('');

  // Estados para el Modal de Nuevo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  // ==========================================
  // VALIDACIÓN DE USUARIO Y SESIÓN
  // ==========================================
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  let userName = 'Marlon Jonathan'; // Fallback por defecto
  let userRole = 'Recepcionista';
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userName = parsedUser.nombre || 'Marlon Jonathan';
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading and error state belong to this API request.
    fetchClientes();
  }, [fetchClientes]);

  const remove=async(cliente)=>{if(!window.confirm('¿Eliminar a '+cliente.nombre+'? Si tiene historial, cambia su estado a Inactivo.'))return;try{const r=await fetch(API_URL+'/recepcion/clientes/'+cliente.id_usuario,{method:'DELETE',headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error((await r.json()).message);await fetchClientes();}catch(e){setError(e.message);}};
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
      setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
      fetchClientes();
      setCredential(result.temporaryPassword ? `${result.message} Contraseña temporal para ${formData.email}: ${result.temporaryPassword}` : result.message || 'Cliente guardado.');
    } catch (err) {
      console.error(err);
      alert(err.message);
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
      {/* SIDEBAR EXCLUSIVO DE RECEPCIÓN */}
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
        
        <nav className="sidebar-nav">
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

        {/* ==========================================
            BLOQUE DE PERFIL INFERIOR (COMPACTO Y ELEVADO)
            ========================================== */}
        <div style={{ 
          marginTop: 'auto', 
          marginBottom: '80vh', /* <-- Eleva el bloque bastante del fondo */
          paddingTop: '15px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #51ffaa, #00d4ff)', 
            color: '#05080c', fontSize: '1.4rem', fontWeight: '900', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '4px', /* <-- Espacio reducido */
            boxShadow: '0 8px 15px rgba(0, 212, 255, 0.2)' 
          }}>
            {userInitial}
          </div>
          
          <p style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: '0', textAlign: 'center', letterSpacing: '0.5px' }}>
            {userName}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#8e9ba8', margin: '0 0 12px 0', /* <-- Espacio reducido */ textAlign: 'center' }}>
            {userRole}
          </p>

          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '10px', /* <-- Botón más compacto */
              background: 'rgba(255, 77, 77, 0.05)', 
              border: '1px solid rgba(255, 77, 77, 0.3)', 
              color: '#ff6b6b', fontWeight: '700', borderRadius: '10px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease' 
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content"><Alerts reception/>{credential&&<div className="panel-recep" role="status"><p>{credential}</p><button onClick={()=>setCredential('')}>Ocultar</button></div>}
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
          <button className="btn-recep-primary" onClick={() => {setFormData({nombre:'',apellido:'',email:'',telefono:'',estado:'Activo'});setIsModalOpen(true);}}>
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
                <th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Cargando clientes...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="7" style={{ color: '#ff4d4d', textAlign: 'center', padding: '20px' }}>{error}</td>
                </tr>
              )}
              {!loading && !error && clientesFiltrados.map(cliente => (
                <tr key={cliente.id_usuario}>
                  <td style={{ color: '#8e9ba8' }}>{`ED-${String(cliente.id_usuario).padStart(3, '0')}`}</td>
                  <td style={{ fontWeight: '700' }}>{`${cliente.nombre} ${cliente.apellido}`}</td>
                  <td>{cliente.telefono}</td>
                  <td style={{ color: '#00d4ff' }}>{cliente.nombre_plan || 'Sin plan'}</td>
                  <td>{formatDate(cliente.fecha_fin)}</td>
                  <td>
                    <span className={`badge-estado ${(cliente.estado || '').toLowerCase()}`}>
                      {(cliente.estado || 'Sin estado').toUpperCase()}
                    </span>
                  </td><td><button className="btn-edit" onClick={()=>{setFormData({...cliente,telefono:cliente.telefono || ''});setIsModalOpen(true);}}>Editar</button><button className="btn-edit" onClick={()=>remove(cliente)}>Eliminar</button></td>
                </tr>
              ))}
              {!loading && !error && clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ==========================================
          MODAL DE CREAR CLIENTE
          ========================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="panel-recep" style={{ width: '100%', maxWidth: '500px', padding: '30px', background: '#0b1626' }}>
            <h2 style={{ marginBottom: '20px', color: '#fff' }}>{formData.id_usuario?'Editar cliente':'Registrar nuevo cliente'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label style={{ color: '#8e9ba8', fontSize: '0.85rem' }} htmlFor="client-nombre">Nombre</label>
                <input 
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                  id="client-nombre" value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>
              
              <div className="input-group">
                <label style={{ color: '#8e9ba8', fontSize: '0.85rem' }} htmlFor="client-apellido">Apellido</label>
                <input 
                  type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                  id="client-apellido" value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label style={{ color: '#8e9ba8', fontSize: '0.85rem' }} htmlFor="client-email">Correo Electrónico</label>
                <input 
                  type="email" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                  id="client-email" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label style={{ color: '#8e9ba8', fontSize: '0.85rem' }} htmlFor="client-telefono">Teléfono</label>
                <input 
                  type="text" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                  id="client-telefono" value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1f2d3d', color: '#8e9ba8', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <label>Estado<select value={formData.estado||'Activo'} onChange={e=>setFormData({...formData,estado:e.target.value})}><option>Activo</option><option>Inactivo</option><option>Moroso</option></select></label><button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: '#38d996', border: 'none', color: '#07111f', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
