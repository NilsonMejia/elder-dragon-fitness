import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos nuestras vistas
// En lugar de tener todo suelto, ahora se ve así:
import Home from './views/public/Home';
import Login from './views/public/Login';
import Dashboard from './views/admin/Dashboard';
import Usuarios from './views/admin/Usuarios';
import Planes from './views/admin/Planes';
import Reportes from './views/admin/Reportes';
import Configuracion from './views/admin/Configuracion';
import Clientes from './views/recepcion/Clientes';
import Rutinas from './views/admin/Rutinas';

function App() {
  return (
    <Router>
      {/* Todo lo que esté dentro de Routes cambiará dinámicamente con animaciones */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/planes" element={<Planes />} />
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/admin/configuracion" element={<Configuracion />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/usuarios" element={<Navigate to="/admin/usuarios" replace />} />
        <Route path="/planes" element={<Navigate to="/admin/planes" replace />} />
        <Route path="/reportes" element={<Navigate to="/admin/reportes" replace />} />
        <Route path="/configuracion" element={<Navigate to="/admin/configuracion" replace />} />
        <Route path="/admin/rutinas" element={<Rutinas />} />
      </Routes>
    </Router>
  );
}

export default App;
