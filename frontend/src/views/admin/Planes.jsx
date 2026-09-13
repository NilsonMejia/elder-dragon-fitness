import React from 'react';
import '../../css/Admin.css';

const Planes = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Elder <span>Dragón</span></h2>
        <nav className="sidebar-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/usuarios">Gestión de Usuarios</a>
          <a href="/planes" className="active">Planes de Membresía</a>
          <a href="/reportes">Reportes</a>
          <a href="/configuracion">Configuración</a>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="content-header flex-between">
          <div>
            <h1>Planes de Membresía</h1>
            <p>Configura los precios y duración de los planes.</p>
          </div>
          <button className="admin-btn-primary">+ Crear Plan</button>
        </header>

        <div className="planes-grid">
          {/* Datos extraídos de tu SQL */}
          <div className="plan-card">
            <h3>Mensual Estándar</h3>
            <div className="plan-price">$25.00</div>
            <p>Duración: 30 días</p>
            <button className="btn-edit-full">Modificar Precio</button>
          </div>
          <div className="plan-card">
            <h3>Trimestral VIP</h3>
            <div className="plan-price">$65.00</div>
            <p>Duración: 90 días</p>
            <button className="btn-edit-full">Modificar Precio</button>
          </div>
          <div className="plan-card premium">
            <h3>Anual Premium</h3>
            <div className="plan-price">$220.00</div>
            <p>Duración: 365 días</p>
            <button className="btn-edit-full">Modificar Precio</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Planes;