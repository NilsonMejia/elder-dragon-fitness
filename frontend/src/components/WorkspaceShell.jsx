import { NavLink, useNavigate } from 'react-router-dom';
import { logout, sessionUser } from '../lib/api';
import AdminLayout from './AdminLayout';
import '../css/admin.css';
import '../css/workflows.css';
import '../css/workspace.css';

function NavigationIcon({ kind }) {
  const paths = {
    profile: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" /></>,
    routine: <><path d="m6 6 12 12M3 9l6-6M15 21l6-6M2 6l4-4M18 22l4-4" /></>,
    catalog: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    payment: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M9 12h12m-5-5 5 5-5 5" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export default function WorkspaceShell({ children }) {
  const user = sessionUser();
  const navigate = useNavigate();
  const links = user?.rol === 'Cliente'
    ? [['/cliente/perfil', 'Mi Estado de Cuenta', 'profile'], ['/cliente/rutina', 'Mi Rutina Asignada', 'routine']]
    : user?.rol === 'Entrenador'
      ? [['/entrenador', 'Asignaciones', 'routine'], ['/entrenador/catalogo', 'Catálogo', 'catalog']]
      : [['/recepcion/clientes', 'Clientes', 'profile'], ['/recepcion/pagos', 'Pagos', 'payment']];
  if (user?.rol === 'Administrador') return <AdminLayout>{children}</AdminLayout>;
  return <div className="admin-layout workspace-layout">
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-wrap"><img src="/logo-dragon.png" alt="Elder Dragon" className="brand-logo-img" onError={event => { event.currentTarget.style.display = 'none'; }} /><span className="brand-logo-fallback" aria-hidden="true">D</span></div>
        <div className="brand-titles"><span className="brand-title-top">Elder</span><span className="brand-title-bottom">Dragon Fitness</span></div>
      </div>
      <nav className="sidebar-nav" aria-label="Menú principal"><span className="nav-section">{user?.rol === 'Cliente' ? 'MI ENTRENAMIENTO' : 'PRINCIPAL'}</span>{links.map(([to, label, icon]) => <NavLink end key={to} to={to} className="nav-item"><span className="nav-icon"><NavigationIcon kind={icon} /></span><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-user-block">
        <div className="user-avatar-large" aria-hidden="true">{(user?.nombre || 'U').charAt(0).toUpperCase()}</div>
        <p className="user-name-large">{user?.nombre}</p><p className="user-role-large">{user?.rol === 'Cliente' ? 'Atleta (Cliente)' : user?.rol}</p>
        <button className="logout-btn-square" onClick={() => { logout(); navigate('/login'); }}><NavigationIcon kind="logout" /><span>Cerrar Sesión</span></button>
      </div>
    </aside>
    <main className="admin-content workspace-content">{children}</main>
  </div>;
}
