import React from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const Configuracion = () => (
  <AdminPageShell>
    <header className="content-header">
      <div>
        <h1>Configuracion del Sistema</h1>
        <p>Ajustes globales para facturacion, datos legales y operacion.</p>
      </div>
    </header>

    <form className="config-form">
      <section className="config-section">
        <h3>Datos Fiscales del Gimnasio</h3>
        <div className="input-group">
          <label>Nombre Legal</label>
          <input type="text" className="admin-input" defaultValue="Elder Dragon Fitness S.A de C.V" />
        </div>
        <div className="input-group">
          <label>NIT / NRC</label>
          <input type="text" className="admin-input" defaultValue="0000-000000-000-0" />
        </div>
        <div className="input-group">
          <label>Direccion Sucursal Principal</label>
          <input type="text" className="admin-input" defaultValue="Universidad Catolica de El Salvador, Santa Ana" />
        </div>
      </section>

      <section className="config-section">
        <h3>Parametros Operativos</h3>
        <div className="input-group">
          <label>Impuesto IVA %</label>
          <input type="number" className="admin-input" defaultValue="13" />
        </div>
      </section>

      <div className="config-actions">
        <button type="button" className="admin-btn-primary">Guardar Cambios</button>
        <button type="button" className="admin-btn-secondary">Restaurar</button>
      </div>
    </form>
  </AdminPageShell>
);

export default Configuracion;
