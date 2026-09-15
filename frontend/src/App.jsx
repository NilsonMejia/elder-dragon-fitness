import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Vistas Públicas
import Home from './views/public/Home';
import Login from './views/public/Login';

// Vistas de Administrador
import Dashboard from './views/admin/Dashboard';
import Usuarios from './views/admin/Usuarios';
import Planes from './views/admin/Planes';
import Reportes from './views/admin/Reportes';
import Configuracion from './views/admin/Configuracion';
import Rutinas from './views/admin/Rutinas';

// Vistas de Recepción
import Clientes from './views/recepcion/Clientes';
import Pagos from './views/recepcion/Pagos';

// Vistas de Cliente (NUEVAS)
import MiPerfil from './views/cliente/MiPerfil';
import MiRutina from './views/cliente/MiRutina';

function App() {
  return (
    <Router>
      <Routes>
        {/* PÚBLICO */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ADMINISTRADOR */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/planes" element={<Planes />} />
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/admin/configuracion" element={<Configuracion />} />
        <Route path="/admin/rutinas" element={<Rutinas />} />

        {/* RECEPCIÓN */}
        <Route path="/recepcion/clientes" element={<Clientes />} />
        <Route path="/recepcion/pagos" element={<Pagos />} />

        {/* CLIENTE (NUEVAS RUTAS) */}
        <Route path="/cliente/perfil" element={<MiPerfil />} />
        <Route path="/cliente/rutina" element={<MiRutina />} />

        {/* REDIRECCIONES CORTAS */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;