import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const roleClass = (rol) => (rol ? rol.toLowerCase().replace(' ', '-') : 'cliente');
const statusClass = (estado) => (estado ? estado.toLowerCase() : 'activo');

const Usuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error al obtener la lista de usuarios del servidor.');

        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con la base de datos para cargar los usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [navigate]);

  return (
    <AdminPageShell>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra accesos, roles y estado operativo del sistema en tiempo real.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">Exportar</button>
          <button className="btn-gradient">+ Nuevo Usuario</button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#00ff88', gap: '15px' }}>
          <div className="spinner"></div>
          <p>Sincronizando usuarios desde PostgreSQL...</p>
        </div>
      ) : (
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
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.id_usuario}</td>
                    <td>{usuario.nombre} {usuario.apellido}</td>
                    <td>
                      <span className={`badge-rol ${roleClass(usuario.nombre_rol)}`}>
                        {usuario.nombre_rol}
                      </span>
                    </td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`badge-status ${statusClass(usuario.estado)}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn-edit">Editar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#8e9ba8', padding: '30px' }}>
                    No se encontraron usuarios registrados en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
};

export default Usuarios;