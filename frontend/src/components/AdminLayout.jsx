import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../css/Admin.css'; // Nuestro CSS global

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Administrador');

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (storedUser) {
      try { setAdminName(JSON.parse(storedUser).nombre); } catch (_) {}
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Efectos visuales globales para todo el sistema */}
      <div className="glow green-glow"></div>
      <div className="glow blue-glow"></div>
      <div className="dragon-scales-overlay"></div>

      {/* ==================== SIDEBAR MAESTRO ==================== */}
      <aside className="admin-sidebar">
        <div className="brand-logo">
          <img src="/logo-dragon.png" alt="Logo" className="dragon-img-logo" onError={(e) => e.target.style.display = 'none'} />
          <div className="brand-text">Elder <span className="signature-text">Dragón</span></div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">Principal</span>
          <NavLink to="/admin/dashboard" className="nav-item"><span className="nav-icon">📊</span> Dashboard</NavLink>
          <NavLink to="/admin/usuarios" className="nav-item"><span className="nav-icon">👥</span> Usuarios</NavLink>
          <NavLink to="/admin/planes" className="nav-item"><span className="nav-icon">🎟️</span> Planes</NavLink>

          <span className="nav-section">Análisis</span>
          <NavLink to="/admin/reportes" className="nav-item"><span className="nav-icon">📈</span> Reportes</NavLink>
          <NavLink to="/admin/rutinas" className="nav-item"><span className="nav-icon">🏋️</span> Rutinas</NavLink>

          <span className="nav-section">Sistema</span>
          <NavLink to="/admin/configuracion" className="nav-item"><span className="nav-icon">⚙️</span> Configuración</NavLink>
        </nav>

        <div className="sidebar-user-block">
          <div className="user-avatar-large">{adminName.charAt(0).toUpperCase()}</div>
          <div className="user-name-large">{adminName}</div>
          <div className="user-role-large">Administrador</div>
          <button className="logout-btn-square" onClick={handleLogout} title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      {/* ==================== CONTENIDO DINÁMICO ==================== */}
      <main className="admin-content">
        {/* Topbar global para todas las vistas */}
        <div className="admin-topbar">
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar en el sistema..." />
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn">🔔</button>
            <button className="topbar-btn">💬</button>
          </div>
        </div>

        {/* Aquí se inyectará la pantalla específica (Dashboard, Rutinas, etc.) */}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;