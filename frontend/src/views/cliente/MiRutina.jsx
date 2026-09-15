import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/Cliente.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconDumbbell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>;

const MiRutina = () => {
  const [rutinaAsignada, setRutinaAsignada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchRutina = async () => {
      if (!token) {
        setError('Sesion no encontrada.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cliente/rutina`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar tu rutina.');
        }

        setRutinaAsignada(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRutina();
  }, [token]);

  const nombreRutina = rutinaAsignada?.nombre || 'Sin rutina asignada';
  const entrenador = rutinaAsignada?.entrenador || 'tu entrenador';
  const detalles = rutinaAsignada?.detalles || [];

  return (
    <div className="cliente-layout">
      {/* SIDEBAR DEL CLIENTE */}
      <aside className="cliente-sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <img src="/logo-dragon.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#e2e8f0', letterSpacing: '3px', textTransform: 'uppercase' }}>Elder</span>
            <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.6rem', color: '#00ff88' }}>DragÃ³n</span>
          </div>
        </div>
        
        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/cliente/perfil" className="nav-item" style={{ display: 'flex', gap: '10px', color: '#8e9ba8', textDecoration: 'none', padding: '10px' }}>
            <IconUser /> Mi Estado de Cuenta
          </Link>
          <Link to="/cliente/rutina" className="nav-item active" style={{ display: 'flex', gap: '10px', color: '#00ff88', textDecoration: 'none', padding: '10px' }}>
            <IconDumbbell /> Mi Rutina Asignada
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="cliente-content">
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Tu Entrenamiento de Hoy</h1>
        <p style={{ color: '#8e9ba8', marginBottom: '30px' }}>
          {loading ? 'Cargando rutina asignada...' : error || `Asignado por el entrenador ${entrenador}.`}
        </p>

        <div className="cliente-panel" style={{ borderTop: '4px solid #00d4ff' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00d4ff' }}>{nombreRutina}</h2>
          <table className="cliente-table">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Series x Reps</th>
                <th>Peso Asignado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3">Cargando ejercicios...</td>
                </tr>
              )}
              {!loading && detalles.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600' }}>{item.ejercicio}</td>
                  <td style={{ color: '#00ff88' }}>{item.series}</td>
                  <td>{item.peso}</td>
                </tr>
              ))}
              {!loading && detalles.length === 0 && (
                <tr>
                  <td colSpan="3">No hay ejercicios asignados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MiRutina;
