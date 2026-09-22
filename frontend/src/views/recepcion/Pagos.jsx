import { Notice } from '../../components/Notifications';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const Pagos = () => {
  const navigate = useNavigate();
  
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [idPlan, setIdPlan] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [preview,setPreview]=useState(null);
  const paymentOperation=useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setMensaje('Sesión no encontrada.');
        setLoading(false);
        return;
      }

      try {
        const [clientesResponse, planesResponse] = await Promise.all([
          fetch(`${API_URL}/recepcion/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/recepcion/planes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const clientesData = await clientesResponse.json();
        const planesData = await planesResponse.json();

        if (!clientesResponse.ok) throw new Error(clientesData.message || 'Error al cargar clientes.');
        if (!planesResponse.ok) throw new Error(planesData.message || 'Error al cargar planes.');

        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setPlanes(Array.isArray(planesData) ? planesData : []);
      } catch (fetchError) {
        setMensaje(fetchError.message);
        setClientes([]); 
        setPlanes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const sugerenciasClientes = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return [];

    return clientes.filter((cliente) => {
      const id = `ed-${String(cliente.id_usuario || '').padStart(3, '0')}`;
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id.includes(texto) || nombreCompleto.includes(texto);
    }).slice(0, 6);
  }, [clienteBusqueda, clientes]);

  const clienteSeleccionado = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return null;

    return clientes.find((cliente) => {
      const id = `ed-${String(cliente.id_usuario || '').padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id === texto || nombreCompleto === texto;
    }) || null;
  }, [clienteBusqueda, clientes]);

  const planSeleccionado = useMemo(() => {
    if (!Array.isArray(planes)) return null;
    return planes.find((plan) => String(plan.id_plan) === String(idPlan)) || null;
  }, [idPlan, planes]);

  const customerId=clienteSeleccionado?.id_usuario;
  const planId=planSeleccionado?.id_plan;
  useEffect(()=>{let active=true;if(customerId&&planId)fetch(API_URL+'/recepcion/renovacion?id_cliente='+customerId+'&id_plan='+planId,{headers:{Authorization:'Bearer '+token}}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.message);return d;}).then(d=>{if(active)setPreview({...d,customerId,planId});}).catch(e=>{if(active)setMensaje(e.message);});return()=>{active=false;};},[customerId,planId,token]);
  const validPreview=preview&&preview.customerId===customerId&&preview.planId===planId;
  const fechaCorteCalculada=validPreview ? preview.fecha_fin+' (inicia '+preview.fecha_inicio+')' : 'Selecciona cliente y plan';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!clienteSeleccionado || !planSeleccionado) {
      setMensaje('Selecciona un cliente de la lista y un plan válidos.');
      return;
    }

    if(isSubmitting)return;
    setIsSubmitting(true);
    const fingerprint=JSON.stringify([clienteSeleccionado.id_usuario,planSeleccionado.id_plan,planSeleccionado.precio,metodoPago]);
    if(paymentOperation.current?.fingerprint!==fingerprint)paymentOperation.current={fingerprint,key:crypto.randomUUID()};

    try {
      const response = await fetch(`${API_URL}/recepcion/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempotency_key: paymentOperation.current.key,
          id_cliente: clienteSeleccionado.id_usuario,
          id_plan: planSeleccionado.id_plan,
          monto: Number(planSeleccionado.precio),
          metodo_pago: metodoPago,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo procesar el pago.');

      setMensaje(`Pago registrado. Nueva vigencia: ${data.membresia.fecha_inicio.slice(0,10)} a ${data.membresia.fecha_fin.slice(0,10)}. Recibo: ${data.pago.num_factura_electronica}`);
      paymentOperation.current=null;
      setClienteBusqueda('');
      setIdPlan('');
      setMetodoPago('efectivo');
    } catch (submitError) {
      setMensaje(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="recepcion-layout">
      {/* SIDEBAR */}
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
        
        {/* ==========================================
            BLOQUE DE PERFIL INFERIOR (ESTILO IMAGEN)
            ========================================== */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, #51ffaa, #00d4ff)', 
            color: '#05080c', fontSize: '1.6rem', fontWeight: '900', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '10px', boxShadow: '0 8px 20px rgba(0, 212, 255, 0.2)' 
          }}>
            {userInitial}
          </div>
          
          <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', textAlign: 'center', letterSpacing: '0.5px' }}>
            {userName}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#8e9ba8', margin: '0 0 20px 0', textAlign: 'center' }}>
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content">
        <header className="content-header">
          <div>
            <h1>Procesamiento de Pagos</h1>
            <p>Registra mensualidades, emite facturas y actualiza las fechas de corte.</p>
          </div>
        </header>

        <div className="panel-recep">
          <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Registrar Nuevo Pago</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="input-group" style={{ position: 'relative' }}>
                <label>Buscar Cliente (ID o Nombre)</label>
                <input
                  type="text"
                  placeholder="Ej. ED-002 o Ana López"
                  required
                  autoComplete="off"
                  value={clienteBusqueda}
                  onChange={(e) => {
                    setClienteBusqueda(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}
                />
                
                {showDropdown && sugerenciasClientes.length > 0 && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0b1626', border: '1px solid #1f2d3d', borderRadius: '6px', marginTop: '5px', padding: 0, listStyle: 'none', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                    {sugerenciasClientes.map(cliente => (
                      <li 
                        key={cliente.id_usuario}
                        onClick={() => {
                          setClienteBusqueda(`ED-${String(cliente.id_usuario).padStart(3, '0')}`);
                          setShowDropdown(false);
                        }}
                        style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 'bold' }}>{cliente.nombre} {cliente.apellido}</span>
                        <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>ED-{String(cliente.id_usuario).padStart(3, '0')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group">
                <label>Plan a Renovar</label>
                <select required value={idPlan} onChange={(e) => setIdPlan(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}>
                  <option value="">{loading ? 'Cargando planes...' : 'Seleccione un plan...'}</option>
                  {planes.map((plan) => (
                    <option key={plan.id_plan} value={plan.id_plan}>
                      {plan.nombre_plan} - ${Number(plan.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Método de Pago</label>
                <select required value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #1f2d3d', background: '#07111f', color: '#fff' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div className="input-group">
                <label>Nueva Fecha de Corte Calculada</label>
                <input type="text" value={fechaCorteCalculada} readOnly disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#00d4ff' }} />
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <button type="submit" className="btn-recep-primary" disabled={isSubmitting || loading || !validPreview}>
                {isSubmitting ? 'Procesando en BD...' : 'Registrar pago'}
              </button>
            </div>

            <Notice message={mensaje} type={mensaje.includes('registrado') ? 'success' : 'error'} onClose={() => setMensaje('')} />
          </form>
        </div>
      </main>
    </div>
  );
};

export default Pagos;