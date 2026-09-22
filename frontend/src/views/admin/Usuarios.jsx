import { Notice, useNotifications } from '../../components/Notifications';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageShell } from './Dashboard';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const roleClass = (rol) => (rol ? rol.toLowerCase().replace(' ', '-') : 'cliente');
const statusClass = (estado) => (estado ? estado.toLowerCase() : 'activo');

const Usuarios = () => {
  const { notify, confirm } = useNotifications();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credential,setCredential]=useState('');

  // Estados para el Modal de Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('crear'); // 'crear' | 'editar'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_usuario: null,
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'Cliente',
    estado: 'Activo'
  });

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Envolver la petición en useCallback para poder llamarla al cargar y al guardar cambios
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
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
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading and error state belong to this API request.
    fetchUsuarios();
  }, [token, navigate, fetchUsuarios]);

  // ==========================================
  // 1. FUNCIONALIDAD: EXPORTAR A CSV
  // ==========================================
  const handleExport = () => {
    if (usuarios.length === 0) return;
    
    const headers = ['ID', 'Nombre', 'Apellido', 'Rol', 'Email', 'Telefono', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...usuarios.map(u => [
        u.id_usuario, 
        u.nombre, 
        u.apellido, 
        u.nombre_rol, 
        u.email, 
        u.telefono || 'N/A', 
        u.estado
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Usuarios_Elder_Dragon_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ==========================================
  // 2. FUNCIONALIDAD: ABRIR MODALES
  // ==========================================
  const openCreateModal = () => {
    setModalMode('crear');
    setFormData({ id_usuario: null, nombre: '', apellido: '', email: '', telefono: '', rol: 'Cliente', estado: 'Activo' });
    setIsModalOpen(true);
  };

  const openEditModal = (usuario) => {
    setModalMode('editar');
    setFormData({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.nombre_rol,
      estado: usuario.estado
    });
    setIsModalOpen(true);
  };

  // ==========================================
  // 3. FUNCIONALIDAD: GUARDAR EN BASE DE DATOS
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const method = modalMode === 'crear' ? 'POST' : 'PUT';
    const endpoint = modalMode === 'crear' 
      ? `${API_URL}/admin/usuarios` 
      : `${API_URL}/admin/usuarios/${formData.id_usuario}`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Error al guardar el usuario.');

      // Si todo sale bien, cerramos el modal y refrescamos la tabla
      setIsModalOpen(false);
      fetchUsuarios();
      
      if (modalMode === 'crear') {
        setCredential(result.temporaryPassword ? `${result.message} Contraseña temporal para ${formData.email}: ${result.temporaryPassword}` : result.message);
      }
    } catch (err) {
      console.error(err);
      notify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete=async(user)=>{
    if(!await confirm('¿Eliminar a '+user.nombre+'? Si tiene historial, suspende su cuenta en Editar.', { title: 'Confirmar cambio', confirmLabel: 'Confirmar', danger: true }))return;
    try{const response=await fetch(API_URL+'/admin/usuarios/'+user.id_usuario,{method:'DELETE',headers:{Authorization:'Bearer '+token}});if(!response.ok)throw new Error((await response.json()).message);await fetchUsuarios();}catch(e){setError(e.message);}
  };
  return (
    <AdminPageShell>
      <Notice message={credential} type="info" onClose={() => setCredential('')} />
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra accesos, roles y estado operativo del sistema en tiempo real.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleExport}>📥 Exportar CSV</button>
          <button className="btn-gradient" onClick={openCreateModal}>+ Nuevo Usuario</button>
        </div>
      </header>

      <Notice message={error} onClose={() => setError('')} />

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
                      <button className="btn-edit" onClick={() => openEditModal(usuario)}>✏️ Editar</button> <button className="btn-edit" onClick={()=>handleDelete(usuario)}>Eliminar</button>
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

      {/* ==========================================
          MODAL DE CREAR / EDITAR
          ========================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px', color: '#fff' }}>
              {modalMode === 'crear' ? '✨ Nuevo Usuario' : '✏️ Editar Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label htmlFor="user-nombre">Nombre</label>
                <input 
                  type="text" className="admin-input" required 
                  id="user-nombre" value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="user-apellido">Apellido</label>
                <input 
                  type="text" className="admin-input" required 
                  id="user-apellido" value={formData.apellido}
                  onChange={(e) => setFormData({...formData, apellido: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label htmlFor="user-email">Correo Electrónico</label>
                <input 
                  type="email" className="admin-input" required 
                  id="user-email" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label htmlFor="user-telefono">Teléfono</label>
                  <input 
                    type="text" className="admin-input" 
                    id="user-telefono" value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="user-rol">Rol</label>
                  <select 
                    className="admin-input" 
                    id="user-rol" value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Entrenador">Entrenador</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>

              {modalMode === 'editar' && (
                <div className="input-group">
                  <label>Estado</label>
                  <select 
                    className="admin-input" 
                    value={formData.estado} 
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Moroso">Moroso</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gradient" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default Usuarios;
