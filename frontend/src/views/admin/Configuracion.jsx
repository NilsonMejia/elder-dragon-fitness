import React from 'react';
import '../../css/Admin.css';

const Configuracion = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Elder <span>Dragón</span></h2>
        <nav className="sidebar-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/usuarios">Gestión de Usuarios</a>
          <a href="/planes">Planes de Membresía</a>
          <a href="/reportes">Reportes</a>
          <a href="/configuracion" className="active">Configuración</a>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <h1>Configuración del Sistema</h1>
          <p>Ajustes globales para la facturación electrónica y parámetros legales.</p>
        </header>

        <form className="config-form">
          <div className="config-section">
            <h3>Datos Fiscales del Gimnasio</h3>
            <div className="input-group">
              <label>Nombre Legal</label>
              <input type="text" className="admin-input" defaultValue="Elder Dragón Fitness S.A de C.V" />
            </div>
            <div className="input-group">
              <label>NIT / NRC</label>
              <input type="text" className="admin-input" defaultValue="0000-000000-000-0" />
            </div>
            <div className="input-group">
              <label>Dirección Sucursal Principal</label>
              <input type="text" className="admin-input" defaultValue="Universidad Católica de El Salvador, Santa Ana" />
            </div>
          </div>

          <div className="config-section">
            <h3>Parámetros Operativos</h3>
            <div className="input-group">
              <label>Impuesto (IVA %)</label>
              <input type="number" className="admin-input" defaultValue="13" />
            </div>
          </div>

          <button type="button" className="admin-btn-primary">Guardar Cambios</button>
        </form>
      </main>
    </div>
  );
};

export default Configuracion;