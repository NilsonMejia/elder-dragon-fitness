import React from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const Reportes = () => (
  <AdminPageShell>
    <header className="content-header">
      <div>
        <h1>Reportes Financieros</h1>
        <p>Exporta ingresos, pagos, membresias y auditoria del sistema.</p>
      </div>
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
          <option>Ingresos por Membresia</option>
          <option>Clientes Morosos</option>
          <option>Nuevos Registros</option>
        </select>
      </div>
    </div>

    <div className="report-actions">
      <button className="admin-btn-secondary">Generar PDF</button>
      <button className="admin-btn-secondary excel">Exportar Excel</button>
    </div>
  </AdminPageShell>
);

export default Reportes;
