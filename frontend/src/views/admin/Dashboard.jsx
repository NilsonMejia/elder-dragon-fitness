import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import '../../css/admin.css';
import Alerts from '../../components/Alerts';
import { sessionUser } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// =========================================================
// ICONOS SVG (estilo Feather — línea limpia y consistente)
// =========================================================
const Icon = ({ path, size = 18, color = 'currentColor', extra }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
    {extra}
  </svg>
);

const IconDashboard = (p) => (
  <Icon {...p} path={<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>} />
);
const IconUsers = (p) => (
  <Icon {...p} path={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
);
const IconPlanes = (p) => (
  <Icon {...p} path={<><path d="M20 12V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5" /><path d="M2 12h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /><path d="M6 12V7" /><path d="M18 12V7" /></>} />
);
const IconReportes = (p) => (
  <Icon {...p} path={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="9" y2="17" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="15" y1="14" x2="15" y2="17" /></>} />
);
const IconRutinas = (p) => (
  <Icon {...p} path={<><path d="M6.5 6.5l11 11" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" /><path d="M18 22l4-4" /><path d="M2 6l4-4" /><path d="M3 10l7-7" /><path d="M14 21l7-7" /></>} />
);
const IconConfig = (p) => (
  <Icon {...p} path={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />
);
const IconLogout = (p) => (
  <Icon {...p} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
);
const IconActivos = (p) => (
  <Icon {...p} path={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>} />
);
const IconAlerta = (p) => (
  <Icon {...p} path={<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>} />
);
const IconDinero = (p) => (
  <Icon {...p} path={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} />
);
const IconNuevo = (p) => (
  <Icon {...p} path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
);
const IconMenos = (p) => (
  <Icon {...p} path={<line x1="5" y1="12" x2="19" y2="12" />} />
);
const IconPago = (p) => (
  <Icon {...p} path={<><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>} />
);

// =========================================================
// SIDEBAR
// =========================================================
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
        <span className="nav-icon"><IconDashboard /></span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/admin/usuarios" className="nav-item">
        <span className="nav-icon"><IconUsers /></span>
        <span>Usuarios</span>
      </NavLink>
      <NavLink to="/admin/planes" className="nav-item">
        <span className="nav-icon"><IconPlanes /></span>
        <span>Planes</span>
      </NavLink>

      <NavLink to="/admin/reportes" className="nav-item">
        <span className="nav-icon"><IconReportes /></span>
        <span>Reportes</span>
      </NavLink>
      <NavLink to="/admin/rutinas" className="nav-item">
        <span className="nav-icon"><IconRutinas /></span>
        <span>Rutinas</span>
      </NavLink>

      <NavLink to="/admin/asignaciones" className="nav-item">Asignaciones</NavLink>
      <NavLink to="/recepcion/clientes" className="nav-item">Clientes</NavLink>
      <NavLink to="/recepcion/pagos" className="nav-item">Pagos</NavLink>
      <NavLink to="/admin/configuracion" className="nav-item">
        <span className="nav-icon"><IconConfig /></span>
        <span>Configuración</span>
      </NavLink>
    </nav>

    <div className="sidebar-user-block">
      <div className="user-avatar-large">{adminName.charAt(0).toUpperCase()}</div>
      <p className="user-name-large">{adminName}</p>
      <p className="user-role-large">Administrador</p>
      <button className="logout-btn-square" onClick={onLogout} title="Cerrar sesión">
        <span className="logout-icon"><IconLogout size={18} /></span>
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
  const adminName = sessionUser()?.nombre || 'Admin';

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

// =========================================================
// DASHBOARD
// =========================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const adminName = sessionUser()?.nombre || 'Admin';
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    activos: 0, morosos: 0, ingresos: 0, rutinas: 0,
    nuevosMes: 0, cancelaciones: 0, pagosHoy: 0, sinPlan: 0,
  });
  const [chartIngresos, setChartIngresos] = useState([]);
  const [chartMembresias, setChartMembresias] = useState([]);
  const [chartPlanes, setChartPlanes] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [topClientes, setTopClientes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
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
          pagosHoy: data.stats?.pagosHoy || 0,
          sinPlan: data.stats?.sinPlan || 0,
        });

        if (data.chartIngresos && Array.isArray(data.chartIngresos)) {
          setChartIngresos(data.chartIngresos.map(i => ({ mes: i.mes, ingresos: Number(i.ingresos) })));
        } else setChartIngresos([]);

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
    { label: 'Clientes Activos', value: stats.activos, Icon: IconActivos, tone: 'green' },
    { label: 'Clientes Morosos', value: stats.morosos, Icon: IconAlerta, tone: 'red' },
    { label: 'Ingresos del Mes', value: money(stats.ingresos), Icon: IconDinero, tone: 'blue' },
    { label: 'Nuevos Este Mes', value: `+${stats.nuevosMes}`, Icon: IconNuevo, tone: 'green' },
    { label: 'Membresías vencidas / inactivas', value: stats.cancelaciones, Icon: IconMenos, tone: 'red' },
  ];

  const activityIcons = {
    pago: IconPago,
    nuevo: IconNuevo,
    cancelacion: IconMenos,
  };

  return (
    <AdminPageShell>
      <Alerts />
      <header
        className="content-header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '50px',
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
            {kpis.map((kpi) => {
              const IconCmp = kpi.Icon;
              return (
                <div key={kpi.label} className={`stat-card tone-${kpi.tone}`}>
                  <div className="stat-head">
                    <span className="stat-icon"><IconCmp size={18} /></span>
                    <span>{kpi.label}</span>
                  </div>
                  <p className="stat-value">{kpi.value}</p>
                </div>
              );
            })}
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
                  <div className="empty-state" style={{ border: 'none' }}><p>Sin ingresos registrados</p></div>
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
                      data={chartPlanes} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      paddingAngle={3} labelLine={false} label={renderCustomizedLabel}
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
                  <div className="empty-state" style={{ border: 'none' }}><p>Sin datos de planes</p></div>
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
                  <div className="empty-state" style={{ border: 'none' }}><p>Sin datos de membresías</p></div>
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
                  actividadReciente.map((item) => {
                    const IconCmp = activityIcons[item.tipo] || IconAlerta;
                    return (
                      <li key={item.id} className={`activity-item ${item.tipo}`}>
                        <span className="activity-icon"><IconCmp size={16} /></span>
                        <div className="activity-body">
                          <p>{item.texto}</p>
                          <span className="activity-time">{item.hora}</span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <p style={{ color: '#8e9ba8', fontSize: '0.85rem' }}>No hay actividad reciente registrada en la BD.</p>
                )}
              </ul>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Clientes por gasto acumulado</h3>
              </div>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Plan</th>
                      <th>Pagos</th>
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
                          <td>{cliente.pagos}</td>
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