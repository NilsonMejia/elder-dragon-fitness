import ProtectedRoute from './components/ProtectedRoute';
import Asignaciones from './views/entrenador/Asignaciones';
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

        <Route element={<ProtectedRoute roles={['Administrador']} />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/planes" element={<Planes />} />
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/admin/configuracion" element={<Configuracion />} />
        <Route path="/admin/rutinas" element={<Rutinas />} />

        <Route path="/admin/asignaciones" element={<Navigate to="/admin/rutinas" replace />} /></Route>
<Route element={<ProtectedRoute roles={['Entrenador']} />}>
<Route path="/entrenador" element={<Asignaciones />} />
<Route path="/entrenador/catalogo" element={<Rutinas />} />
</Route>
<Route element={<ProtectedRoute roles={['Recepcionista']} />}>
        <Route path="/recepcion/clientes" element={<Clientes />} />
        <Route path="/recepcion/pagos" element={<Pagos />} />

        </Route><Route element={<ProtectedRoute roles={['Cliente']} />}>
        <Route path="/cliente/perfil" element={<MiPerfil />} />
        <Route path="/cliente/rutina" element={<MiRutina />} />

        </Route>
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;