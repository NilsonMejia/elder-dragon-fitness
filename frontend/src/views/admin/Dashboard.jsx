import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import '../../css/admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Sidebar = ({ adminName, onLogout }) => (
  <aside className="admin-sidebar">
    <div className="sidebar-brand">
      <div className="brand-logo-wrap">
        <img
          src="/logo-dragon.png"
          alt="Elder Dragon"
          className="brand-logo-img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="brand-logo-fallback">D</span>
      </div>
      <div className="brand-titles">
        <span className="brand-title-top">Elder</span>
        <span className="brand-title-bottom">Dragon Fitness</span>
      </div>
    </div>

    <nav className="sidebar-nav">
      <span className="nav-section">Principal</span>
      <NavLink to="/admin/dashboard" className="nav-item">
        <span className="nav-icon">#</span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/admin/usuarios" className="nav-item">
        <span className="nav-icon">@</span>
        <span>Usuarios</span>
      </NavLink>
      <NavLink to="/admin/planes" className="nav-item">
        <span className="nav-icon">$</span>
        <span>Planes</span>
      </NavLink>

      <span className="nav-section">Analisis</span>
      <NavLink to="/admin/reportes" className="nav-item">
        <span className="nav-icon">%</span>
        <span>Reportes</span>
      </NavLink>
      <NavLink to="/admin/rutinas" className="nav-item">
        <span className="nav-icon">R</span>
        <span>Rutinas</span>
      </NavLink>

      <span className="nav-section">Sistema</span>
      <NavLink to="/admin/configuracion" className="nav-item">
        <span className="nav-icon">*</span>
        <span>Configuracion</span>
      </NavLink>
    </nav>

    <div className="sidebar-user-block">
      <div className="user-avatar-large">{adminName.charAt(0).toUpperCase()}</div>
      <p className="user-name-large">{adminName}</p>
      <p className="user-role-large">Administrador</p>
      <button className="logout-btn-square" onClick={onLogout} title="Cerrar sesion">
        <span className="logout-icon">⏻</span>
        <span className="logout-text">Cerrar Sesion</span>
      </button>
    </div>
  </aside>
);

const AdminTopbar = () => (
  <div className="admin-topbar">
    <div className="topbar-search">
      <span className="search-icon">⌕</span>
      <input type="text" placeholder="Buscar clientes, planes, rutinas..." />
    </div>
    <div className="topbar-actions">
      <button className="topbar-btn" title="Notificaciones">
        !<span className="notif-dot"></span>
      </button>
      <button className="topbar-btn" title="Mensajes">?</button>
    </div>
  </div>
);

export const AdminPageShell = ({ children }) => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const adminName = storedUser ? JSON.parse(storedUser).nombre : 'Admin';

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <Sidebar adminName={adminName} onLogout={handleLogout} />
      <main className="admin-content">
        <AdminTopbar />
        {children}
      </main>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activos: 0,
    morosos: 0,
    ingresos: 0,
    rutinas: 0,
    nuevosMes: 12,
    cancelaciones: 2,
    asistenciaHoy: 45,
    ocupacion: 68,
  });
  const [chartIngresos, setChartIngresos] = useState([]);
  const [chartMembresias, setChartMembresias] = useState([]);
  const [chartPlanes, setChartPlanes] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [topClientes, setTopClientes] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser) {
      try {
        setAdminName(JSON.parse(storedUser).nombre);
      } catch (_) {
        setAdminName('Admin');
      }
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Error al conectar con el servidor');
        }

        const data = await response.json();
        const activos = data.clientes?.activos || data.stats?.activos || 0;
        const morosos = data.clientes?.morosos || data.stats?.morosos || 0;
        const ingresos = data.ingresosMes || data.stats?.ingresos || 0;
        const rutinas = data.rutinas?.total || data.stats?.rutinas || 0;

        setStats((prev) => ({ ...prev, activos, morosos, ingresos, rutinas }));
        setChartIngresos(data.chart || [
          { mes: 'Abr', ingresos: 820 },
          { mes: 'May', ingresos: 960 },
          { mes: 'Jun', ingresos: 1120 },
          { mes: 'Jul', ingresos: 1035 },
          { mes: 'Ago', ingresos: 1280 },
          { mes: 'Sep', ingresos },
        ]);
        setChartMembresias([
          { mes: 'Jul', activos: Math.max(activos - 10, 0), morosos: morosos + 3 },
          { mes: 'Ago', activos: Math.max(activos - 5, 0), morosos: morosos + 1 },
          { mes: 'Sep', activos, morosos },
        ]);
        setChartPlanes([
          { name: 'Basico', value: 62, color: '#00d4ff' },
          { name: 'Pro', value: 54, color: '#00ff88' },
          { name: 'Premium', value: 32, color: '#bb00ff' },
        ]);
        setActividadReciente([
          { id: 1, tipo: 'nuevo', texto: 'Maria Lopez se registro en plan Pro', hora: 'Hace 12 min' },
          { id: 2, tipo: 'pago', texto: 'Carlos Ramirez pago membresia Premium', hora: 'Hace 45 min' },
          { id: 3, tipo: 'cancelacion', texto: 'Juan Perez cancelo su membresia', hora: 'Hace 2 h' },
          { id: 4, tipo: 'nuevo', texto: 'Ana Torres se registro en plan Basico', hora: 'Hace 3 h' },
        ]);
        setTopClientes([
          { id: 1, nombre: 'Carlos Ramirez', plan: 'Premium', asistencia: 26, gasto: 145 },
          { id: 2, nombre: 'Maria Lopez', plan: 'Pro', asistencia: 22, gasto: 110 },
          { id: 3, nombre: 'Luis Martinez', plan: 'Pro', asistencia: 20, gasto: 95 },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const money = (n = 0) =>
    `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const kpis = [
    { label: 'Clientes Activos', value: stats.activos, icon: 'C', tone: 'green' },
    { label: 'Clientes Morosos', value: stats.morosos, icon: '!', tone: 'red' },
    { label: 'Ingresos del Mes', value: money(stats.ingresos), icon: '$', tone: 'blue' },
    { label: 'Rutinas Asignadas', value: stats.rutinas, icon: 'R', tone: 'purple' },
    { label: 'Nuevos Este Mes', value: `+${stats.nuevosMes}`, icon: '+', tone: 'green' },
    { label: 'Cancelaciones', value: stats.cancelaciones, icon: '-', tone: 'red' },
    { label: 'Asistencia Hoy', value: stats.asistenciaHoy, icon: 'A', tone: 'green' },
    { label: 'Ocupacion', value: `${stats.ocupacion}%`, icon: '%', tone: 'blue' },
  ];

  return (
    <AdminPageShell>
      <header className="content-header">
        <div>
          <h1>Panel de Control</h1>
          <p>
            Bienvenido de nuevo, <strong className="text-green">{adminName}</strong>. Aqui tienes el resumen de hoy.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">Hoy</button>
          <button className="btn-gradient">+ Nuevo Cliente</button>
        </div>
      </header>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Sincronizando con la base de datos...</p>
        </div>
      ) : (
        <>
          <section className="stats-grid">
            {kpis.map((kpi) => (
              <div key={kpi.label} className={`stat-card tone-${kpi.tone}`}>
                <div className="stat-head">
                  <span className="stat-icon">{kpi.icon}</span>
                  <span>{kpi.label}</span>
                </div>
                <p className="stat-value">{kpi.value}</p>
                <span className="stat-trend">↑ vs mes anterior</span>
              </div>
            ))}
          </section>

          <section className="charts-grid">
            <div className="chart-container wide">
              <div className="chart-head">
                <h3>Flujo de Ingresos</h3>
                <span className="chart-badge">Ultimos 6 meses</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartIngresos} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mes" stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} />
                  <Area type="monotone" dataKey="ingresos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="chart-head">
                <h3>Distribucion por Plan</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartPlanes} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {chartPlanes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#050608" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#8e9ba8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container wide">
              <div className="chart-head">
                <h3>Membresias: Activos vs Morosos</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartMembresias} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mes" stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="activos" fill="#00ff88" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="morosos" fill="#ff4d4d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="dashboard-bottom">
            <div className="panel">
              <div className="panel-head">
                <h3>Actividad Reciente</h3>
                <button className="panel-link">Ver todo</button>
              </div>
              <ul className="activity-list">
                {actividadReciente.map((item) => (
                  <li key={item.id} className={`activity-item ${item.tipo}`}>
                    <span className="activity-icon">{item.tipo === 'pago' ? '$' : item.tipo === 'nuevo' ? '+' : '!'}</span>
                    <div className="activity-body">
                      <p>{item.texto}</p>
                      <span className="activity-time">{item.hora}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Top Clientes del Mes</h3>
                <button className="panel-link">Ver ranking</button>
              </div>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Plan</th>
                      <th>Asist.</th>
                      <th>Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>
                          <div className="client-cell">
                            <span className="client-avatar">{cliente.nombre.charAt(0)}</span>
                            <span>{cliente.nombre}</span>
                          </div>
                        </td>
                        <td><span className={`badge-plan ${cliente.plan.toLowerCase()}`}>{cliente.plan}</span></td>
                        <td>{cliente.asistencia}</td>
                        <td className="text-green bold">${cliente.gasto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminPageShell>
  );
};

export default Dashboard;
