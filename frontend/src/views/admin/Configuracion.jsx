import React from 'react';
import '../../css/Admin.css';

const Reportes = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Elder <span>Dragón</span></h2>
        <nav className="sidebar-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/usuarios">Gestión de Usuarios</a>
          <a href="/planes">Planes de Membresía</a>
          <a href="/reportes" className="active">Reportes</a>
          <a href="/configuracion">Configuración</a>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <h1>Reportes Financieros</h1>
          <p>Exporta la contabilidad y auditoría del sistema.</p>
        </header>

        <div className="report-filters">
          <div className="filter-group">
            <label>Fecha Inicio</label>
            <input type="date" className="admin-input" />
          </div>
          <div className="filter-group">
            <label>Fecha Fin</label>
            <input type="date" className="admin-input" />
          </div>
          <div className="filter-group">
            <label>Tipo de Reporte</label>
            <select className="admin-input">
              <option>Ingresos por Membresía</option>
              <option>Clientes Morosos</option>
              <option>Nuevos Registros</option>
            </select>
          </div>
        </div>

        <div className="report-actions">
          <button className="admin-btn-secondary">Generar PDF</button>
          <button className="admin-btn-secondary excel">Exportar Excel</button>
        </div>
      </main>
    </div>
  );
};

export default Reportes;