import PaymentForm from '../../components/PaymentForm';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/Recepcion.css';


// Íconos SVG limpios
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconPago = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Pagos = () => {
  const navigate = useNavigate();
  
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  let userName = 'Recepción';
  let userRole = 'Recepcionista';
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userName = parsedUser.nombre || 'Recepción';
      userRole = parsedUser.rol || parsedUser.nombre_rol || 'Recepcionista';
    } catch (e) {
      console.error('Error al leer el usuario:', e);
    }
  }
  
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="recepcion-layout">
      {/* SIDEBAR */}
      <aside className="recepcion-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src="/logo-dragon.png" alt="Elder Dragon" className="brand-logo-img" />
          </div>
          <div className="brand-titles">
            <span className="brand-title-top">Elder</span>
            <span className="brand-title-bottom">Dragon Fitness</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <span style={{ color: '#8e9ba8', fontSize: '0.75rem', fontWeight: 'bold', margin: '10px 0 5px 10px', display: 'block', letterSpacing: '1px' }}>
            RECEPCIÓN
          </span>
          <Link to="/recepcion/clientes" className="nav-item">
            <IconUsers /> Directorio de Clientes
          </Link>
          <Link to="/recepcion/pagos" className="nav-item active">
            <IconPago /> Control de Pagos
          </Link>
        </nav>
        
        {/* ==========================================
            BLOQUE DE PERFIL INFERIOR (ESTILO IMAGEN)
            ========================================== */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, #51ffaa, #00d4ff)', 
            color: '#05080c', fontSize: '1.6rem', fontWeight: '900', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '10px', boxShadow: '0 8px 20px rgba(0, 212, 255, 0.2)' 
          }}>
            {userInitial}
          </div>
          
          <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', textAlign: 'center', letterSpacing: '0.5px' }}>
            {userName}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#8e9ba8', margin: '0 0 20px 0', textAlign: 'center' }}>
            {userRole}
          </p>

          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', 
              background: 'rgba(255, 77, 77, 0.05)', 
              border: '1px solid rgba(255, 77, 77, 0.3)', 
              color: '#ff6b6b', fontWeight: '700', borderRadius: '12px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease' 
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = 'rgba(255, 77, 77, 0.15)'; 
              e.currentTarget.style.borderColor = '#ff4d4d'; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)'; 
              e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.3)'; 
            }}
          >
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="recepcion-content">
        <header className="content-header">
          <div>
            <h1>Procesamiento de Pagos</h1>
            <p>Registra mensualidades, emite facturas y actualiza las fechas de corte.</p>
          </div>
        </header>

        <PaymentForm />
      </main>
    </div>
  );
};

export default Pagos;