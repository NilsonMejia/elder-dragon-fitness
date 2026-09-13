import React from 'react';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const usuarios = [
  { id: 1, nombre: 'Nilson Mejia', rol: 'Administrador', email: 'admin@elderdragon.com', estado: 'Activo' },
  { id: 2, nombre: 'Yasmidali Galdamez', rol: 'Recepcionista', email: 'recepcion1@elderdragon.com', estado: 'Activo' },
  { id: 4, nombre: 'Carlos Perez', rol: 'Entrenador', email: 'entrenador.carlos@elderdragon.com', estado: 'Activo' },
  { id: 7, nombre: 'Jorge Lopez', rol: 'Cliente', email: 'jorge.lopez@gmail.com', estado: 'Activo' },
];

const roleClass = (rol) => rol.toLowerCase().replace(' ', '-');
const statusClass = (estado) => estado.toLowerCase();

const Usuarios = () => (
  <AdminPageShell>
    <header className="content-header">
      <div>
        <h1>Gestion de Usuarios</h1>
        <p>Administra accesos, roles y estado operativo del sistema.</p>
      </div>
      <div className="header-actions">
        <button className="btn-outline">Exportar</button>
        <button className="btn-gradient">+ Nuevo Usuario</button>
      </div>
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
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td><span className={`badge-rol ${roleClass(usuario.rol)}`}>{usuario.rol}</span></td>
              <td>{usuario.email}</td>
              <td><span className={`badge-status ${statusClass(usuario.estado)}`}>{usuario.estado}</span></td>
              <td><button className="btn-edit">Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminPageShell>
);

export default Usuarios;
