import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/Recepcion.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Ãconos SVG limpios
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

const Pagos = () => {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [idPlan, setIdPlan] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setMensaje('Sesion no encontrada.');
        setLoading(false);
        return;
      }

      try {
        const [clientesResponse, planesResponse] = await Promise.all([
          fetch(`${API_URL}/recepcion/clientes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/recepcion/planes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const clientesData = await clientesResponse.json();
        const planesData = await planesResponse.json();

        if (!clientesResponse.ok) {
          throw new Error(clientesData.message || 'No se pudieron cargar los clientes.');
        }

        if (!planesResponse.ok) {
          throw new Error(planesData.message || 'No se pudieron cargar los planes.');
        }

        setClientes(clientesData);
        setPlanes(planesData);
      } catch (fetchError) {
        setMensaje(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const clienteSeleccionado = useMemo(() => {
    const texto = clienteBusqueda.trim().toLowerCase();
    if (!texto) return null;

    return clientes.find((cliente) => {
      const id = `ED-${String(cliente.id_usuario).padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id === texto || nombreCompleto === texto || nombreCompleto.includes(texto);
    }) || null;
  }, [clienteBusqueda, clientes]);

  const planSeleccionado = useMemo(
    () => planes.find((plan) => String(plan.id_plan) === String(idPlan)) || null,
    [idPlan, planes]
  );

  const fechaCorteCalculada = useMemo(() => {
    if (!planSeleccionado) return 'Se calcularÃ¡ automÃ¡ticamente...';

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + Number(planSeleccionado.duracion_dias || 0));
    return fecha.toISOString().slice(0, 10);
  }, [planSeleccionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!clienteSeleccionado || !planSeleccionado) {
      setMensaje('Selecciona un cliente y un plan validos.');
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
          id_plan: planSeleccionado.id_plan,
          monto: Number(planSeleccionado.precio),
          metodo_pago: metodoPago,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo procesar el pago.');
      }

      setMensaje('Pago procesado correctamente.');
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
      {/* SIDEBAR EXCLUSIVO DE RECEPCIÃ“N */}
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
            RECEPCIÃ“N
          </span>
          <Link to="/recepcion/clientes" className="nav-item">
            <IconUsers /> Directorio de Clientes
          </Link>
          <Link to="/recepcion/pagos" className="nav-item active">
            <IconPago /> Control de Pagos
          </Link>
        </nav>
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
              <div className="input-group">
                <label>Buscar Cliente (ID o Nombre)</label>
                <input
                  type="text"
                  placeholder="Ej. ED-002 o Ana LÃ³pez"
                  required
                  value={clienteBusqueda}
                  onChange={(e) => setClienteBusqueda(e.target.value)}
                  list="clientes-recepcion"
                />
                <datalist id="clientes-recepcion">
                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id_usuario}
                      value={`${cliente.nombre} ${cliente.apellido}`}
                    />
                  ))}
                </datalist>
              </div>
              <div className="input-group">
                <label>Plan a Renovar</label>
                <select required value={idPlan} onChange={(e) => setIdPlan(e.target.value)}>
                  <option value="">{loading ? 'Cargando planes...' : 'Seleccione un plan...'}</option>
                  {planes.map((plan) => (
                    <option key={plan.id_plan} value={plan.id_plan}>
                      {plan.nombre_plan} - ${Number(plan.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>MÃ©todo de Pago</label>
                <select required value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de CrÃ©dito / DÃ©bito</option>
                </select>
              </div>
              <div className="input-group">
                <label>Nueva Fecha de Corte Calculada</label>
                <input type="text" value={fechaCorteCalculada} readOnly disabled />
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn-recep-primary" disabled={isSubmitting || loading}>
                {isSubmitting ? 'Procesando...' : 'âœ“ Procesar Pago'}
              </button>
            </div>
            {mensaje && <p style={{ marginTop: '15px' }}>{mensaje}</p>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Pagos;
