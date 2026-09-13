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
      <span className="nav-section">PRINCIPAL</span>
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
      <NavLink to="/admin/reportes" className="nav-item">
        <span className="nav-icon">%</span>
        <span>Reportes</span>
      </NavLink>
      <NavLink to="/admin/rutinas" className="nav-item">
        <span className="nav-icon">R</span>
        <span>Rutinas</span>
      </NavLink>
      <NavLink to="/admin/configuracion" className="nav-item">
        <span className="nav-icon">*</span>
        <span>Configuración</span>
      </NavLink>
    </nav>

    <div className="sidebar-user-block">
      <div className="user-avatar-large">{adminName.charAt(0).toUpperCase()}</div>
      <p className="user-name-large">{adminName}</p>
      <p className="user-role-large">Administrador</p>
      <button className="logout-btn-square" onClick={onLogout} title="Cerrar sesión">
        <span className="logout-icon">⏻</span>
        <span className="logout-text">Cerrar Sesión</span>
      </button>
    </div>
  </aside>
);

const AdminTopbar = () => (
  <div className="admin-topbar" style={{ display: 'none' }}></div>
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
  
  // ESTADOS 100% CONECTADOS A LA BD
  const [stats, setStats] = useState({
    activos: 0,
    morosos: 0,
    ingresos: 0,
    rutinas: 0,
    nuevosMes: 0,
    cancelaciones: 0,
    asistenciaHoy: 0,
    ocupacion: 0,
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

        if (!response.ok) throw new Error('Error al conectar con el servidor');

        const data = await response.json();
        
        setStats({
          activos: data.stats?.activos || 0,
          morosos: data.stats?.morosos || 0,
          ingresos: data.stats?.ingresos || 0,
          rutinas: data.stats?.rutinas || 0,
          nuevosMes: data.stats?.nuevosMes || 0,
          cancelaciones: data.stats?.cancelaciones || 0,
          asistenciaHoy: data.stats?.asistenciaHoy || 0,
          ocupacion: data.stats?.ocupacion || 0,
        });

        // CORRECCIÓN APLICADA: Ahora lee chartIngresos y lo convierte a número
        if (data.chartIngresos && Array.isArray(data.chartIngresos)) {
          const ingresosFormateados = data.chartIngresos.map(item => ({
            mes: item.mes,
            ingresos: Number(item.ingresos)
          }));
          setChartIngresos(ingresosFormateados);
        } else {
          setChartIngresos([]);
        }

        setChartMembresias(data.chartMembresias || []);
        setChartPlanes(data.chartPlanes || []);
        setActividadReciente(data.actividadReciente || []);
        setTopClientes(data.topClientes || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const money = (n = 0) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Etiqueta personalizada para mostrar % en el PieChart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const kpis = [
    { label: 'Clientes Activos', value: stats.activos, icon: 'C', tone: 'green' },
    { label: 'Clientes Morosos', value: stats.morosos, icon: '!', tone: 'red' },
    { label: 'Ingresos del Mes', value: money(stats.ingresos), icon: '$', tone: 'blue' },
    
    { label: 'Nuevos Este Mes', value: `+${stats.nuevosMes}`, icon: '+', tone: 'green' },
    { label: 'Cancelaciones', value: stats.cancelaciones, icon: '-', tone: 'red' },
  
  ];

  return (
    <AdminPageShell>
      <header 
        className="content-header" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          marginBottom: '50px' 
        }}
      >
        <h1 style={{ fontSize: '3.2rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 10px 0' }}>
          Panel de Control
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#8e9ba8', fontWeight: '500' }}>
          Bienvenido de nuevo, <strong className="text-green" style={{ fontWeight: '800' }}>{adminName}</strong>. Rendimiento en tiempo real.
        </p>
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
                <span className="chart-badge">Últimos meses</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                {chartIngresos.length > 0 ? (
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
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} 
                      formatter={(value) => [money(value), 'Ingresos']}
                    />
                    <Area type="monotone" dataKey="ingresos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                  </AreaChart>
                ) : (
                  <div className="empty-state" style={{border: 'none'}}><p>Sin ingresos registrados</p></div>
                )}
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="chart-head">
                <h3>Distribución por Plan</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                {chartPlanes.length > 0 ? (
                  <PieChart>
                    <Pie 
                      data={chartPlanes} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={3}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {chartPlanes.map((entry) => (
                        <Cell key={entry.name} fill={entry.color || '#00ff88'} stroke="#050608" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} 
                      formatter={(value, name) => [`${value} clientes`, name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#8e9ba8' }} />
                  </PieChart>
                ) : (
                  <div className="empty-state" style={{border: 'none'}}><p>Sin datos de planes</p></div>
                )}
              </ResponsiveContainer>
            </div>

            <div className="chart-container wide">
              <div className="chart-head">
                <h3>Membresías: Activos vs Morosos</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                {chartMembresias.length > 0 ? (
                  <BarChart data={chartMembresias} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="mes" stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8e9ba8" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#10161e', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: '#fff' }} 
                      formatter={(value, name) => [value, name === 'activos' ? 'Clientes Activos' : 'Clientes Morosos']}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="activos" fill="#00ff88" radius={[6, 6, 0, 0]} name="Activos" />
                    <Bar dataKey="morosos" fill="#ff4d4d" radius={[6, 6, 0, 0]} name="Morosos" />
                  </BarChart>
                ) : (
                  <div className="empty-state" style={{border: 'none'}}><p>Sin datos de membresías</p></div>
                )}
              </ResponsiveContainer>
            </div>
          </section>

          <section className="dashboard-bottom">
            <div className="panel">
              <div className="panel-head">
                <h3>Actividad Reciente</h3>
              </div>
              <ul className="activity-list">
                {actividadReciente.length > 0 ? (
                  actividadReciente.map((item) => (
                    <li key={item.id} className={`activity-item ${item.tipo}`}>
                      <span className="activity-icon">{item.tipo === 'pago' ? '$' : item.tipo === 'nuevo' ? '+' : '!'}</span>
                      <div className="activity-body">
                        <p>{item.texto}</p>
                        <span className="activity-time">{item.hora}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <p style={{ color: '#8e9ba8', fontSize: '0.85rem' }}>No hay actividad reciente registrada en la BD.</p>
                )}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Top Clientes del Mes</h3>
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
                    {topClientes.length > 0 ? (
                      topClientes.map((cliente) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#8e9ba8', padding: '20px' }}>
                          No hay clientes para mostrar de la BD.
                        </td>
                      </tr>
                    )}
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