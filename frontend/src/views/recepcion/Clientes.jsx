import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Recepcion.css';

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

const Clientes = () => {
  const clientes = [
    { id: 'ED-001', nombre: 'Carlos Mendoza', telefono: '+503 7777-1111', plan: 'Anual Premium', estado: 'activo', fechaCorte: '2026-10-15' },
    { id: 'ED-002', nombre: 'Ana López', telefono: '+503 7777-2222', plan: 'Mensual Estándar', estado: 'moroso', fechaCorte: '2026-09-10' },
    { id: 'ED-003', nombre: 'Jorge Castro', telefono: '+503 7777-3333', plan: 'Trimestral VIP', estado: 'inactivo', fechaCorte: '2026-08-01' },
  ];

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
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content">
        <div className="topbar-recep">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar cliente por nombre o ID..." />
          </div>
        </div>

        <header className="content-header">
          <div>
            <h1>Directorio de Clientes</h1>
            <p>Gestiona expedientes digitales y verifica el estado de las membresías.</p>
          </div>
          <button className="btn-recep-primary">+ Nuevo Cliente</button>
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
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td style={{ color: '#8e9ba8' }}>{cliente.id}</td>
                  <td style={{ fontWeight: '700' }}>{cliente.nombre}</td>
                  <td>{cliente.telefono}</td>
                  <td style={{ color: '#00d4ff' }}>{cliente.plan}</td>
                  <td>{cliente.fechaCorte}</td>
                  <td>
                    <span className={`badge-estado ${cliente.estado}`}>
                      {cliente.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Clientes;