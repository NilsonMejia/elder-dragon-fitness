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

const Pagos = () => {
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
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="input-group">
                <label>Buscar Cliente (ID o Nombre)</label>
                <input type="text" placeholder="Ej. ED-002 o Ana López" required />
              </div>
              <div className="input-group">
                <label>Plan a Renovar</label>
                <select required>
                  <option value="">Seleccione un plan...</option>
                  <option value="mensual">Mensual Estándar - $25.00</option>
                  <option value="trimestral">Trimestral VIP - $65.00</option>
                  <option value="anual">Anual Premium - $220.00</option>
                </select>
              </div>
              <div className="input-group">
                <label>Método de Pago</label>
                <select required>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                </select>
              </div>
              <div className="input-group">
                <label>Nueva Fecha de Corte Calculada</label>
                <input type="text" value="Se calculará automáticamente..." readOnly disabled />
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn-recep-primary">✓ Procesar Pago</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Pagos;