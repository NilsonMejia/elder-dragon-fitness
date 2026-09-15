import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/Cliente.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Íconos SVG limpios
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconDumbbell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const MiPerfil = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // VALIDACIÓN DE USUARIO Y SESIÓN
  // ==========================================
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  
  let userNameFallback = 'Cliente';
  if (storedUser) {
    try {
      userNameFallback = JSON.parse(storedUser).nombre || 'Cliente';
    } catch (e) {
      console.error('Error al leer el usuario:', e);
    }
  }

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Sin fecha';
    return new Date(dateValue).toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!token) {
        setError('Sesión no encontrada.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cliente/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar tu perfil.');
        }

        setPerfil(data.cliente);
        // Blindaje de datos: Nos aseguramos de que pagos sea un Array
        setPagos(Array.isArray(data.pagos) ? data.pagos : []);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [token]);

  const nombreCliente = perfil ? perfil.nombre : userNameFallback;
  const estado = perfil?.estado || 'Sin estado';
  const plan = perfil?.nombre_plan || 'Sin membresía';
  const userInitial = nombreCliente.charAt(0).toUpperCase();

  return (
    <div className="cliente-layout">
      {/* SIDEBAR DEL CLIENTE */}
      <aside className="cliente-sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <img src="/logo-dragon.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e2e8f0', letterSpacing: '3px', textTransform: 'uppercase' }}>Elder</span>
            <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.6rem', color: '#00ff88' }}>Dragón</span>
          </div>
        </div>
        
        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/cliente/perfil" className="nav-item active" style={{ display: 'flex', gap: '10px', color: '#00ff88', textDecoration: 'none', padding: '10px' }}>
            <IconUser /> Mi Estado de Cuenta
          </Link>
          <Link to="/cliente/rutina" className="nav-item" style={{ display: 'flex', gap: '10px', color: '#8e9ba8', textDecoration: 'none', padding: '10px' }}>
            <IconDumbbell /> Mi Rutina Asignada
          </Link>
        </nav>

        {/* ==========================================
            BLOQUE DE PERFIL INFERIOR (COMPACTO Y ELEVADO)
            ========================================== */}
        <div style={{ 
          marginTop: 'auto', 
          marginBottom: '12vh',
          paddingTop: '15px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, #51ffaa, #00d4ff)', 
            color: '#05080c', fontSize: '1.4rem', fontWeight: '900', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '4px', 
            boxShadow: '0 8px 15px rgba(0, 212, 255, 0.2)' 
          }}>
            {userInitial}
          </div>
          
          <p style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: '0', textAlign: 'center', letterSpacing: '0.5px' }}>
            {nombreCliente}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#8e9ba8', margin: '0 0 12px 0', textAlign: 'center' }}>
            Atleta (Cliente)
          </p>

          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '10px', 
              background: 'rgba(255, 77, 77, 0.05)', 
              border: '1px solid rgba(255, 77, 77, 0.3)', 
              color: '#ff6b6b', fontWeight: '700', borderRadius: '10px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease' 
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
      <main className="cliente-content">
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Hola, {nombreCliente}</h1>
        <p style={{ color: '#8e9ba8', marginBottom: '30px' }}>Consulta el estado de tu membresía y tus próximos pagos.</p>

        <div className="status-card" style={{ background: '#10161e', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>
              ESTADO: {loading ? 'CARGANDO' : estado.toUpperCase()} {estado.toLowerCase() === 'activo' ? '🟢' : '🔴'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#8e9ba8', margin: 0 }}>
              {error || `Tu membresía "${plan}" ${estado.toLowerCase() === 'activo' ? 'está al día.' : 'requiere revisión.'}`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: '#8e9ba8', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Próximo Corte</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#00ff88' }}>{formatDate(perfil?.fecha_fin)}</p>
          </div>
        </div>

        <div className="cliente-panel" style={{ background: '#10161e', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>Historial de Pagos Recientes</h2>
          <table className="cliente-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '15px 10px', color: '#8e9ba8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fecha de Pago</th>
                <th style={{ padding: '15px 10px', color: '#8e9ba8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Monto</th>
                <th style={{ padding: '15px 10px', color: '#8e9ba8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Plan Renovado</th>
                <th style={{ padding: '15px 10px', color: '#8e9ba8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Método</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#8e9ba8' }}>Cargando pagos...</td>
                </tr>
              )}
              {!loading && pagos.map((pago) => (
                <tr key={pago.id_pago} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '15px 10px', color: '#e2e8f0' }}>{formatDate(pago.fecha_pago)}</td>
                  <td style={{ padding: '15px 10px', color: '#00ff88', fontWeight: 'bold' }}>${Number(pago.monto).toFixed(2)}</td>
                  <td style={{ padding: '15px 10px', color: '#e2e8f0' }}>{pago.nombre_plan}</td>
                  <td style={{ padding: '15px 10px', color: '#e2e8f0', textTransform: 'capitalize' }}>{pago.metodo_pago}</td>
                </tr>
              ))}
              {!loading && pagos.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#8e9ba8' }}>No hay pagos registrados en tu historial.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MiPerfil;