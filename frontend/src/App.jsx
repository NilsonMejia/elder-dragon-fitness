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

        {/* RECEPCIÓN (Aquí está la corrección exacta que el navegador pedía) */}
        <Route path="/recepcion/clientes" element={<Clientes />} />
        <Route path="/recepcion/pagos" element={<Pagos />} />

        {/* REDIRECCIONES CORTAS */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/clientes" element={<Navigate to="/recepcion/clientes" replace />} />
      </Routes>
    </Router>
  );
}

export default App;