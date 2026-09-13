import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos nuestras vistas
// En lugar de tener todo suelto, ahora se ve así:
import Home from './views/public/Home';
import Login from './views/public/Login';
import Dashboard from './views/admin/Dashboard';
import Clientes from './views/recepcion/Clientes';

function App() {
  return (
    <Router>
      {/* Todo lo que esté dentro de Routes cambiará dinámicamente con animaciones */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
      </Routes>
    </Router>
  );
}

export default App;