import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice, useNotifications } from '../../components/Notifications';
import '../../css/Recepcion.css';

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
  const { notify } = useNotifications();

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal de Nuevo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del Formulario incluyendo "estado"[cite: 1]
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: 'Activo'
  });

  // Estado para los Errores de Validación
  const [formErrors, setFormErrors] = useState({});

  // ==========================================
  // VALIDACIÓN DE USUARIO Y SESIÓN
  // ==========================================
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  let userName = 'Recepción';
  let userRole = 'Recepcionista';
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userName = parsedUser.nombre || 'Recepción';
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

  // ==========================================
  // FUNCIONES DE VALIDACIÓN (ONBLUR / ONCHANGE)
  // ==========================================
  const validateField = (name, value) => {
    let errorMsg = '';
    const textVal = value.trim();

    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(textVal)) {
          errorMsg = 'Solo se permiten letras (mín. 2 caracteres).';
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textVal)) {
          errorMsg = 'Formato de correo electrónico inválido.';
        }
        break;
      case 'telefono':
        if (textVal !== '' && !/^[0-9\-\+\s]{8,20}$/.test(textVal)) {
          errorMsg = 'Número inválido. Solo números, guiones y espacios (8-20 dígitos).';
        }
        break;
      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));

    return errorMsg === '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpia el error mientras el usuario corrige el campo
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO CON BLOQUEO
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todo antes de enviar
    const isNombreValid = validateField('nombre', formData.nombre);
    const isApellidoValid = validateField('apellido', formData.apellido);
    const isEmailValid = validateField('email', formData.email);
    const isTelefonoValid = validateField('telefono', formData.telefono);

    if (!isNombreValid || !isApellidoValid || !isEmailValid || !isTelefonoValid) {
      notify('Por favor, corrige los campos marcados en rojo antes de guardar.', 'warning');
      return; // Bloquea la función aquí, no manda nada a la BD
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/recepcion/clientes`, {
        method: 'POST',
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
      notify('¡Cliente registrado exitosamente!', 'success');
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

        {/* BLOQUE DE PERFIL INFERIOR */}
        <div className="sidebar-user-block">
          <div className="user-avatar-large">
            {userInitial}
          </div>
          <p className="user-name-large">
            {userName}
          </p>
          <p className="user-role-large">
            {userRole}
          </p>
          <button 
            onClick={handleLogout} 
            className="logout-btn-reception"
          >
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content">
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
          <button className="btn-recep-primary" onClick={() => { 
            setFormData({ nombre: '', apellido: '', email: '', telefono: '', estado: 'Activo' }); 
            setFormErrors({}); 
            setIsModalOpen(true); 
          }}>
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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando clientes...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="6" style={{ color: '#ff4d4d', textAlign: 'center', padding: '20px' }}>{error}</td>
                </tr>
              )}
              {!loading && !error && clientesFiltrados.map(cliente => (
                <tr key={cliente.id_usuario}>
                  <td style={{ color: '#8e9ba8' }}>{`ED-${String(cliente.id_usuario).padStart(3, '0')}`}</td>
                  <td style={{ fontWeight: '700' }}>{`${cliente.nombre} ${cliente.apellido}`}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td style={{ color: '#00d4ff' }}>{cliente.nombre_plan || 'Sin plan'}</td>
                  <td>{formatDate(cliente.fecha_fin)}</td>
                  <td>
                    <span className={`badge-estado ${(cliente.estado || '').toLowerCase()}`}>
                      {(cliente.estado || 'Sin estado').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !error && clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ==========================================
          MODAL DE CREAR CLIENTE (DISEÑO MEJORADO Y CUADRADO)
          ========================================== */}
      {isModalOpen && (
        <div 
          onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '32px',
              background: '#10161e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 255, 136, 0.05)',
              boxSizing: 'border-box'
            }}
          >
            {/* Encabezado del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  ✨ Registrar Nuevo Cliente
                </h2>
                <p style={{ color: '#8e9ba8', fontSize: '0.85rem', margin: '6px 0 0 0' }}>
                  Ingresa los datos personales para dar de alta al cliente en el sistema.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#8e9ba8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  lineHeight: 1,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  marginLeft: '12px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8e9ba8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
              
              {/* Fila 1: Nombre y Apellido */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    NOMBRE <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="nombre"
                    placeholder="Ej. Carlos"
                    required 
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: formErrors.nombre ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={formData.nombre} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                  />
                  {formErrors.nombre && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>{formErrors.nombre}</span>}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    APELLIDO <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="apellido"
                    placeholder="Ej. Mendoza"
                    required 
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: formErrors.apellido ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={formData.apellido} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                  />
                  {formErrors.apellido && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>{formErrors.apellido}</span>}
                </div>
              </div>

              {/* Fila 2: Correo Electrónico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  CORREO ELECTRÓNICO <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="cliente@ejemplo.com"
                  required 
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: formErrors.email ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={formData.email} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {formErrors.email && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>{formErrors.email}</span>}
              </div>

              {/* Fila 3: Teléfono y Estado Inicial */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    TELÉFONO
                  </label>
                  <input 
                    type="text" 
                    name="telefono"
                    placeholder="Ej. 7890-1234"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: formErrors.telefono ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={formData.telefono} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                  />
                  {formErrors.telefono && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '2px' }}>{formErrors.telefono}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8e9ba8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ESTADO INICIAL
                  </label>
                  <select 
                    name="estado"
                    value={formData.estado} 
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: '#0a0f15',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setFormErrors({}); }}
                  style={{
                    padding: '12px 22px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#8e9ba8',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8e9ba8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                >
                  Cancelar
                </button>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 28px',
                    background: isSubmitting ? 'rgba(0, 255, 136, 0.3)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    border: 'none',
                    color: '#05080c',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(0, 255, 136, 0.25)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
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