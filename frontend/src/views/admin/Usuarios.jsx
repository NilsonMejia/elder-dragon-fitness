import React from 'react';
import '../../css/Admin.css';

const Usuarios = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Elder <span>Dragón</span></h2>
        <nav className="sidebar-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/usuarios" className="active">Gestión de Usuarios</a>
          <a href="/planes">Planes de Membresía</a>
          <a href="/reportes">Reportes</a>
          <a href="/configuracion">Configuración</a>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="content-header flex-between">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra accesos y roles del sistema.</p>
          </div>
          <button className="admin-btn-primary">+ Nuevo Usuario</button>
        </header>

        <div className="data-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Datos simulados de tu base de datos */}
              <tr>
                <td>1</td>
                <td>Nilson Mejía</td>
                <td><span className="badge-rol admin">Administrador</span></td>
                <td>admin@elderdragon.com</td>
                <td><span className="badge-status active">Activo</span></td>
                <td><button className="btn-edit">Editar</button></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Yasmidali Galdamez</td>
                <td><span className="badge-rol recep">Recepcionista</span></td>
                <td>recepcion1@elderdragon.com</td>
                <td><span className="badge-status active">Activo</span></td>
                <td><button className="btn-edit">Editar</button></td>
              </tr>
              <tr>
                <td>4</td>
                <td>Carlos Pérez</td>
                <td><span className="badge-rol coach">Entrenador</span></td>
                <td>entrenador.carlos@elderdragon.com</td>
                <td><span className="badge-status active">Activo</span></td>
                <td><button className="btn-edit">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Usuarios;