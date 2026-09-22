import { NavLink, useNavigate } from 'react-router-dom';
import { logout, sessionUser } from '../lib/api';
import AdminLayout from './AdminLayout';
import '../css/admin.css';
import '../css/workflows.css';

export default function WorkspaceShell({ children }) {
  const user = sessionUser();
  const navigate = useNavigate();
  const links = user?.rol === 'Cliente'
    ? [['/cliente/perfil','Mi perfil'],['/cliente/rutina','Mi rutina']]
    : user?.rol === 'Entrenador'
      ? [['/entrenador','Asignaciones'],['/entrenador/catalogo','Catálogo']]
      : [['/recepcion/clientes','Clientes'],['/recepcion/pagos','Pagos']];
  if (user?.rol === 'Administrador') return <AdminLayout>{children}</AdminLayout>;
  return <div className="admin-layout"><aside className="admin-sidebar">
    <h2>Elder Dragon Fitness</h2><nav className="sidebar-nav">{links.map(([to,label]) => <NavLink end key={to} to={to} className="nav-item">{label}</NavLink>)}</nav>
    <div className="sidebar-user-block"><strong>{user?.nombre}</strong><p>{user?.rol}</p><button className="btn-outline" onClick={()=>{logout();navigate('/login');}}>Cerrar sesión</button></div>
  </aside><main className="admin-content">{children}</main></div>;
}
