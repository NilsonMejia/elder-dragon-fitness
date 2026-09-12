import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos nuestras vistas
import Home from './views/Home';
import Login from './views/Login';

function App() {
  return (
    <Router>
      {/* Todo lo que esté dentro de Routes cambiará dinámicamente con animaciones */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;