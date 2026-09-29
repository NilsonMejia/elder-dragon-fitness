import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { AdminPageShell } from './Dashboard';
import { Notice, useNotifications } from '../../components/Notifications';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminPagos() {
  const { notify, confirm } = useNotifications();
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

  // Carga Inicial del Historial
  const loadPayments = useCallback(async () => {
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
    loadPayments();

    const fetchFormOptions = async () => {
      try {
        const [clientesRes, planesRes] = await Promise.all([
          fetch(`${API_URL}/recepcion/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/planes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (clientesRes.ok) setClientes(await clientesRes.json());
        if (planesRes.ok) setPlanes(await planesRes.json());
      } catch (err) {
        console.error('Error al cargar datos del formulario:', err);
      }
    };

    if (token) fetchFormOptions();
  }, [token, loadPayments]);

  // Buscador Predictivo (Autocomplete)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sugerenciasClientes = useMemo(() => {
    const texto = clienteBusqueda?.trim().toLowerCase() || '';
    if (!texto || !Array.isArray(clientes)) return [];

    return clientes.filter((cliente) => {
      const idStr = `ed-${String(cliente.id_usuario).padStart(3, '0')}`;
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return idStr.includes(texto) || nombreCompleto.includes(texto);
    }).slice(0, 8); 
  }, [clienteBusqueda, clientes]);

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

  const fechaCorteCalculada = useMemo(() => {
    if (!planSeleccionado) return 'Se calculará automáticamente...';

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + Number(planSeleccionado.duracion_dias || 0));
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }, [planSeleccionado]);

  // Validación y Envío
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
      const response = await fetch(`${API_URL}/recepcion/pagos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_cliente: clienteSeleccionado.id_usuario, 
          id_plan: idPlan,
          metodo_pago: metodoPago,
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
    <AdminPageShell>
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
          <div>
            <h1>Gestión de Pagos</h1>
            <p>Registra mensualidades, emite facturas y consulta el historial financiero del gimnasio.</p>
          </div>
        </header>

        {/* Formulario de Pagos (Diseño Admin) */}
        <div className="panel" style={{ padding: '30px', marginBottom: '40px', borderRadius: '16px' }}>
          <h2 style={{ marginBottom: '24px', color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>✨ Registrar Nuevo Pago</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
            <div className="input-group" ref={dropdownRef} style={{ position: 'relative', margin: 0 }}>
              <label htmlFor="pago-cliente" style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                BUSCAR CLIENTE (ID O NOMBRE) <span style={{ color: '#ff4d4d' }}>*</span>
              </label>
              <input
                type="text"
                id="pago-cliente"
                className="admin-input"
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
                style={{ borderColor: formErrors.cliente ? '#ff4d4d' : undefined }}
              />
              {formErrors.cliente && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{formErrors.cliente}</span>}

              {showDropdown && clienteBusqueda.trim().length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, width: '100%',
                  background: 'var(--admin-bg)', border: '1px solid var(--admin-border)',
                  borderRadius: '8px', marginTop: '6px', padding: '6px 0',
                  listStyle: 'none', zIndex: 1000, maxHeight: '240px', overflowY: 'auto',
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
                        padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>{cliente.nombre} {cliente.apellido}</span>
                      <span style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: '700', padding: '2px 8px', background: 'rgba(0,255,136,0.1)', borderRadius: '12px' }}>
                        ED-{String(cliente.id_usuario).padStart(3, '0')}
                      </span>
                    </li>
                  )) : (
                    <li style={{ padding: '12px 18px', color: 'var(--admin-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No se encontraron coincidencias.</li>
                  )}
                </ul>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label htmlFor="pago-plan" style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  PLAN A RENOVAR <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <select
                  id="pago-plan"
                  className="admin-input"
                  value={idPlan}
                  onChange={(e) => {
                    setIdPlan(e.target.value);
                    if (formErrors.idPlan) setFormErrors(prev => ({ ...prev, idPlan: '' }));
                  }}
                  onBlur={(e) => validateField('idPlan', e.target.value)}
                  style={{ borderColor: formErrors.idPlan ? '#ff4d4d' : undefined }}
                >
                  <option value="">Seleccione un plan...</option>
                  {planes.map((plan) => (
                    <option key={plan.id_plan} value={plan.id_plan}>{plan.nombre_plan} - ${Number(plan.precio).toFixed(2)}</option>
                  ))}
                </select>
                {formErrors.idPlan && <span style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{formErrors.idPlan}</span>}
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label htmlFor="pago-metodo" style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  MÉTODO DE PAGO <span style={{ color: '#ff4d4d' }}>*</span>
                </label>
                <select id="pago-metodo" className="admin-input" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                NUEVA FECHA DE CORTE CALCULADA
              </label>
              <input 
                type="text" 
                className="admin-input"
                value={fechaCorteCalculada} 
                readOnly 
                disabled 
                style={{ color: '#00d4ff', fontWeight: '700', opacity: 0.8 }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="btn-gradient" disabled={isSubmitting} style={{ padding: '12px 30px' }}>
                {isSubmitting ? 'Procesando...' : 'Guardar Pago'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Pagos */}
        <section className="panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>Historial de pagos</h2>
            <button type="button" className="btn-outline" onClick={loadPayments} disabled={loading} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              {error ? 'Reintentar' : '↻ Actualizar'}
            </button>
          </div>
          
          <Notice message={error} type="error" onClose={() => setError('')} />
          
          {loading ? (
            <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#00ff88' }}>
               <div className="spinner"></div>
               <p style={{ marginTop: '10px' }}>Sincronizando historial...</p>
            </div>
          ) : error ? (
            <p style={{ color: 'var(--admin-muted)' }}>No se pudo cargar el historial. Usa Reintentar para consultarlo nuevamente.</p>
          ) : payments.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)', textAlign: 'center', padding: '20px' }}>Aún no hay pagos registrados en el sistema.</p>
          ) : (
            <div className="data-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Recibo', 'Cliente', 'Plan', 'Fecha', 'Monto', 'Método', 'Registrado por'].map(title => (
                      <th key={title} scope="col">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id_pago}>
                      <td style={{ color: 'var(--admin-muted)' }}>{payment.num_factura_electronica || 'Sin número'}</td>
                      <td style={{ fontWeight: 'bold', color: '#fff' }}>{payment.cliente}</td>
                      <td><span className="badge-rol admin">{payment.nombre_plan}</span></td>
                      <td>
                        <span style={{ color: '#fff', fontWeight: '600' }}>
                          {new Date(payment.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
                        </span>
                        <br/>
                        <span style={{ color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                          {new Date(payment.fecha_pago).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ color: '#00ff88', fontWeight: 'bold' }}>
                        {Number(payment.monto).toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}
                      </td>
                      <td style={{ color: 'var(--admin-muted)' }}>{payment.metodo_pago}</td>
                      <td style={{ color: 'var(--admin-muted)' }}>{payment.recepcionista}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}