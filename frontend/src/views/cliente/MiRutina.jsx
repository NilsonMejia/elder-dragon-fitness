import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Cliente.css';

const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconDumbbell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>;

const MiRutina = () => {
  const rutinaAsignada = {
    nombre: "Fuerza Pierna Completa",
    entrenador: "Carlos Pérez",
    detalles: [
      { id: 1, ejercicio: "Sentadilla Libre", series: "4 x 10", peso: "Libre" },
      { id: 2, ejercicio: "Prensa Inclinada", series: "4 x 12", peso: "120kg" },
      { id: 3, ejercicio: "Zancadas con Mancuernas", series: "3 x 12", peso: "20kg c/u" },
    ]
  };

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
        <p style={{ color: '#8e9ba8', marginBottom: '30px' }}>Asignado por el entrenador {rutinaAsignada.entrenador}.</p>

        <div className="cliente-panel" style={{ borderTop: '4px solid #00d4ff' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00d4ff' }}>{rutinaAsignada.nombre}</h2>
          <table className="cliente-table">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Series x Reps</th>
                <th>Peso Asignado</th>
              </tr>
            </thead>
            <tbody>
              {rutinaAsignada.detalles.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '600' }}>{item.ejercicio}</td>
                  <td style={{ color: '#00ff88' }}>{item.series}</td>
                  <td>{item.peso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MiRutina;