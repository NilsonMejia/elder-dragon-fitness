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

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Sin membresia';
    return new Date(dateValue).toISOString().slice(0, 10);
  };

  useEffect(() => {
    const fetchClientes = async () => {
      if (!token) {
        setError('Sesion no encontrada.');
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

        setClientes(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [token]);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const id = `ED-${String(cliente.id_usuario).padStart(3, '0')}`.toLowerCase();
      const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
      return id.includes(texto) || nombreCompleto.includes(texto);
    });
  }, [busqueda, clientes]);

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
          <Link to="/recepcion/clientes" className="nav-item active">
            <IconUsers /> Directorio de Clientes
          </Link>
          <Link to="/recepcion/pagos" className="nav-item">
            <IconPago /> Control de Pagos
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content">
        <div className="topbar-recep">
          <div className="search-box">
            <span className="search-icon">ðŸ”</span>
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
            <p>Gestiona expedientes digitales y verifica el estado de las membresÃ­as.</p>
          </div>
          <button className="btn-recep-primary">+ Nuevo Cliente</button>
        </header>

        <div className="panel-recep">
          <table className="recep-table">
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Nombre Completo</th>
                <th>TelÃ©fono</th>
                <th>Plan Actual</th>
                <th>PrÃ³ximo Corte</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6">Cargando clientes...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="6">{error}</td>
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
                  </td>
                </tr>
              ))}
              {!loading && !error && clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Clientes;
