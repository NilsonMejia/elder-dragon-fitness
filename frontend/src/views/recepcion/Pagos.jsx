import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice, useNotifications } from '../../components/Notifications';
import '../../css/Recepcion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Íconos SVG limpios y consistentes
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

const Pagos = () => {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del Formulario de Pagos
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [idPlan, setIdPlan] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

  // Carga del Historial de Pagos
  const loadPayments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/recepcion/pagos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar pagos.');
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de pagos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadPayments();

    const fetchFormOptions = async () => {
      try {
        const [clientesRes, planesRes] = await Promise.all([
          fetch(`${API_URL}/recepcion/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/recepcion/planes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (clientesRes.ok) setClientes(await clientesRes.json());
        if (planesRes.ok) setPlanes(await planesRes.json());
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
      }
    };

    fetchFormOptions();
  }, [token, loadPayments, navigate]);

  // Cerrar Autocomplete al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sugerencias de búsqueda de clientes
  const sugerenciasClientes = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return [];

    return clientes.filter((cliente) => {
      const idStr = `ed-${String(cliente.id_usuario).padStart(3, '0')}`;
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return idStr.includes(texto) || nombreCompleto.includes(texto);
    }).slice(0, 8); 
  }, [clienteBusqueda, clientes]);

  // Cliente actualmente seleccionado
  const clienteSeleccionado = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto) return null;

    const match = texto.match(/ed-(\d+)/);
    if (match) {
      return clientes.find((cliente) => String(cliente.id_usuario) === match[1]) || null;
    }

    return clientes.find((cliente) => {
      const id = `ed-${String(cliente.id_usuario).padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id === texto || nombreCompleto === texto;
    }) || null;
  }, [clienteBusqueda, clientes]);

  const planSeleccionado = useMemo(
    () => planes.find((plan) => String(plan.id_plan) === String(idPlan)) || null,
    [idPlan, planes]
  );

  const [previewFecha, setPreviewFecha] = useState(null);

  useEffect(() => {
    if (clienteSeleccionado?.id_usuario && idPlan) {
      let isMounted = true;
      fetch(`${API_URL}/recepcion/renovacion?id_cliente=${clienteSeleccionado.id_usuario}&id_plan=${idPlan}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data?.fecha_fin) {
          const [y, m, d] = data.fecha_fin.split('-');
          const fecha = new Date(y, m - 1, d);
          const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
          setPreviewFecha(fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1));
        }
      })
      .catch(() => {});
      return () => { isMounted = false; };
    } else {
      setPreviewFecha(null);
    }
  }, [clienteSeleccionado, idPlan, token]);

  const fechaCorteCalculada = useMemo(() => {
    if (previewFecha) return previewFecha;
    if (!planSeleccionado) return 'Se calculará automáticamente...';

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + Number(planSeleccionado.duracion_dias || 0));
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }, [previewFecha, planSeleccionado]);

  // Validaciones del formulario
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'cliente') {
      if (!value.trim()) errorMsg = 'Debes buscar y seleccionar un cliente.';
      else if (!clienteSeleccionado) errorMsg = 'Selecciona un cliente válido del menú desplegable.';
    }
    if (name === 'idPlan' && !value) errorMsg = 'Debes seleccionar el plan a renovar.';

    setFormErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  };

  const validateAll = () => {
    const isClienteValid = validateField('cliente', clienteBusqueda);
    const isPlanValid = validateField('idPlan', idPlan);
    return isClienteValid && isPlanValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      notify('Revisa los campos en rojo antes de continuar.', 'error');
      return;
    }
    setIsSubmitting(true);

    try {
      const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          });

      const response = await fetch(`${API_URL}/recepcion/pagos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          id_cliente: Number(clienteSeleccionado.id_usuario), 
          id_plan: Number(idPlan),
          monto: Number(planSeleccionado?.precio || 0),
          metodo_pago: metodoPago.toLowerCase(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar el pago.');

      notify('Pago registrado exitosamente.', 'success');
      
      setClienteBusqueda('');
      setIdPlan('');
      setMetodoPago('Efectivo');
      setFormErrors({});
      loadPayments();
    } catch (err) {
      console.error(err);
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="recepcion-layout">
      {/* SIDEBAR ORDENADO Y SIN DISTORSIÓN */}
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
          <Link to="/recepcion/clientes" className="nav-item">
            <IconUsers /> Directorio de Clientes
          </Link>
          <Link to="/recepcion/pagos" className="nav-item active">
            <IconPago /> Control de Pagos
          </Link>
        </nav>
        
        {/* BLOQUE DE PERFIL INFERIOR: AVATAR, NOMBRE, ROL Y BOTÓN DE SALIR */}
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

      {/* CONTENIDO PRINCIPAL: GESTIÓN DE PAGOS E HISTORIAL */}
      <main className="recepcion-content">
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px', color: '#fff' }}>Gestión de Pagos</h1>
              <p style={{ color: '#8e9ba8', margin: 0, fontSize: '0.95rem' }}>
                Registra mensualidades, emite facturas y consulta el historial financiero del gimnasio.
              </p>
            </div>
          </header>

          {/* Formulario de Pagos (Idéntico a Admin) */}
          <div style={{
            background: '#10161e',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '35px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginBottom: '24px', color: '#fff', fontSize: '1.25rem', fontWeight: '700' }}>
              ✨ Registrar Nuevo Pago
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
              
              {/* Buscador de Cliente */}
              <div ref={dropdownRef} style={{ position: 'relative', margin: 0 }}>
                <label htmlFor="pago-cliente" style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  BUSCAR CLIENTE (ID O NOMBRE) <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <input
                  type="text"
                  id="pago-cliente"
                  placeholder="Ej. ED-002 o Ana López"
                  autoComplete="off"
                  value={clienteBusqueda}
                  onChange={(e) => {
                    setClienteBusqueda(e.target.value);
                    setShowDropdown(true);
                    if (formErrors.cliente) setFormErrors(prev => ({ ...prev, cliente: '' }));
                  }}
                  onBlur={(e) => validateField('cliente', e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: formErrors.cliente ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.cliente && (
                  <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                    {formErrors.cliente}
                  </span>
                )}

                {showDropdown && clienteBusqueda.trim().length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    background: '#10161e',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    marginTop: '6px',
                    padding: '6px 0',
                    listStyle: 'none',
                    zIndex: 1000,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
                  }}>
                    {sugerenciasClientes.length > 0 ? sugerenciasClientes.map(cliente => (
                      <li 
                        key={cliente.id_usuario}
                        onClick={() => {
                          setClienteBusqueda(`ED-${String(cliente.id_usuario).padStart(3, '0')} - ${cliente.nombre} ${cliente.apellido}`);
                          setShowDropdown(false);
                          setFormErrors(prev => ({ ...prev, cliente: '' }));
                        }}
                        style={{
                          padding: '12px 18px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>
                          {cliente.nombre} {cliente.apellido}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: '700', padding: '3px 8px', background: 'rgba(0,255,136,0.12)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.3)' }}>
                          ED-{String(cliente.id_usuario).padStart(3, '0')}
                        </span>
                      </li>
                    )) : (
                      <li style={{ padding: '14px 18px', color: '#8e9ba8', fontSize: '0.9rem', textAlign: 'center' }}>
                        No se encontraron coincidencias.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Fila: Plan y Método de Pago */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <label htmlFor="pago-plan" style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    PLAN A RENOVAR <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <select
                    id="pago-plan"
                    value={idPlan}
                    onChange={(e) => {
                      setIdPlan(e.target.value);
                      if (formErrors.idPlan) setFormErrors(prev => ({ ...prev, idPlan: '' }));
                    }}
                    onBlur={(e) => validateField('idPlan', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: formErrors.idPlan ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: '#0a0f15',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Seleccione un plan...</option>
                    {planes.map((plan) => (
                      <option key={plan.id_plan} value={plan.id_plan}>
                        {plan.nombre_plan} - ${Number(plan.precio).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {formErrors.idPlan && (
                    <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                      {formErrors.idPlan}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="pago-metodo" style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    MÉTODO DE PAGO <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <select
                    id="pago-metodo"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: '#0a0f15',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              {/* Nueva fecha de corte calculada */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#8e9ba8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  NUEVA FECHA DE CORTE CALCULADA
                </label>
                <input 
                  type="text" 
                  value={fechaCorteCalculada} 
                  readOnly 
                  disabled 
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    background: 'rgba(0, 212, 255, 0.04)',
                    color: '#00d4ff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }} 
                />
              </div>

              {/* Botón de Enviar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '13px 34px',
                    background: isSubmitting ? 'rgba(0,255,136,0.3)' : 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    color: '#05080c',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(0, 255, 136, 0.25)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {isSubmitting ? 'Procesando...' : 'Guardar Pago'}
                </button>
              </div>
            </form>
          </div>

          {/* Historial de Pagos */}
          <section style={{
            background: '#10161e',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700', margin: 0 }}>
                Historial de pagos
              </h2>
              <button
                type="button"
                onClick={loadPayments}
                disabled={loading}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = '#00ff88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                {error ? 'Reintentar' : '↻ Actualizar'}
              </button>
            </div>
            
            <Notice message={error} type="error" onClose={() => setError('')} />
            
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#00ff88' }}>
                 <div className="spinner" style={{
                   width: '36px', height: '36px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite'
                 }}></div>
                 <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#8e9ba8' }}>Sincronizando historial...</p>
              </div>
            ) : error ? (
              <p style={{ color: '#8e9ba8', textAlign: 'center', padding: '20px 0' }}>
                No se pudo cargar el historial. Usa Reintentar para consultarlo nuevamente.
              </p>
            ) : payments.length === 0 ? (
              <p style={{ color: '#8e9ba8', textAlign: 'center', padding: '30px 0' }}>
                Aún no hay pagos registrados en el sistema.
              </p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr>
                      {['Recibo', 'Cliente', 'Plan', 'Fecha', 'Monto', 'Método', 'Registrado por'].map(title => (
                        <th key={title} scope="col" style={{ padding: '14px 16px', color: '#8e9ba8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: '700' }}>
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr 
                        key={payment.id_pago}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px', color: '#8e9ba8', fontSize: '0.88rem' }}>
                          {payment.num_factura_electronica || 'Sin número'}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '700', color: '#fff' }}>
                          {payment.cliente}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'rgba(0, 212, 255, 0.1)',
                            color: '#00d4ff',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            border: '1px solid rgba(0, 212, 255, 0.25)'
                          }}>
                            {payment.nombre_plan}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                            {new Date(payment.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
                          </span>
                          <br/>
                          <span style={{ color: '#8e9ba8', fontSize: '0.75rem' }}>
                            {new Date(payment.fecha_pago).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#00ff88', fontWeight: '800', fontSize: '1rem' }}>
                          {Number(payment.monto).toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}
                        </td>
                        <td style={{ padding: '16px', color: '#8e9ba8', fontSize: '0.9rem' }}>
                          {payment.metodo_pago}
                        </td>
                        <td style={{ padding: '16px', color: '#8e9ba8', fontSize: '0.9rem' }}>
                          {payment.recepcionista}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Pagos;
