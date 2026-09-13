import React from 'react';
import '../../css/Admin.css'; // Usaremos un solo archivo CSS para todo el panel admin

const Dashboard = () => {
  return (
    <div className="admin-layout">
      {/* Menú Lateral Simplificado */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-brand">Elder <span>Dragón</span></h2>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="active">Dashboard</a>
          <a href="/usuarios">Gestión de Usuarios</a>
          <a href="/planes">Planes de Membresía</a>
          <a href="/reportes">Reportes</a>
          <a href="/configuracion">Configuración</a>
          <a href="/login" className="logout-btn">Cerrar Sesión</a>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="admin-content">
        <header className="content-header">
          <h1>Panel de Control Principal</h1>
          <p>Bienvenido Administrador. Aquí tienes el resumen de hoy.</p>
        </header>

        {/* Tarjetas de Estadísticas (Basadas en los requerimientos del proyecto) */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Clientes Activos</h3>
            <p className="stat-value text-green">14</p>
          </div>
          <div className="stat-card">
            <h3>Clientes Morosos</h3>
            <p className="stat-value text-red">3</p>
          </div>
          <div className="stat-card">
            <h3>Ingresos del Mes</h3>
            <p className="stat-value text-blue">$1,245.00</p>
          </div>
          <div className="stat-card">
            <h3>Rutinas Asignadas</h3>
            <p className="stat-value">20</p>
          </div>
        </div>

        {/* Sección temporal para futuras gráficas */}
        <div className="chart-placeholder">
          <h3>Flujo de Ingresos Recientes</h3>
          <div className="chart-box">
            <p>El gráfico se renderizará aquí cuando conectemos con el backend.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;