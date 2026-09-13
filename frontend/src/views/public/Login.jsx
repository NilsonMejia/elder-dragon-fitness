import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const roleRedirects = {
  Administrador: '/admin/dashboard',
  Recepcionista: '/clientes',
  Entrenador: '/admin/dashboard',
  Cliente: '/',
};

// =========================================================
// ICONOS SVG — Ojo visible / Ojo oculto (estilo Feather)
// =========================================================
const EyeIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // TRUCO DE SEGURIDAD: Destruir sesión y vaciar campos
  // =========================================================
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesión.');
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('usuario', JSON.stringify(data.usuario));

      navigate(roleRedirects[data.usuario.rol] || '/', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glow green-glow pulse-extreme"></div>
      <div className="glow blue-glow pulse-extreme-alt"></div>
      <div className="dragon-scales-overlay animate-pan"></div>

      <div className="login-container">
        <aside className="login-brand animate-fade-left">
          <div className="brand-header-centered">
            <div className="brand-logo-badge">
              <img
                src="/logo-dragon.png"
                alt="Logo Dragón"
                className="dragon-img-logo float-anim"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>

            <h1 className="brand-title">
              Elder <span className="signature-text neon-text">Dragón</span>
            </h1>

            <p className="brand-tagline">
              Despierta tu fuerza. <br />
              Domina tu disciplina.
            </p>
          </div>

          <ul className="brand-features">
            <li><span>☑</span> Rutinas personalizadas</li>
            <li><span>☑</span> Seguimiento de progreso</li>
            <li><span>☑</span> Comunidad de élite</li>
          </ul>

          <div className="brand-footer">
            <p>© {new Date().getFullYear()} Elder Dragón Fitness</p>
          </div>
        </aside>

        <main className="login-card-extreme animate-fade-up">
          <header className="login-header">
            <span className="login-chip">Acceso de miembros</span>
            <h2 className="login-title">Bienvenido de vuelta</h2>
            <p className="login-subtitle">
              Ingresa tus credenciales para continuar tu entrenamiento.
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">@</span>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@elderdragon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="new-email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {/* Botón interactivo para alternar la visibilidad */}
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recordar sesión</span>
              </label>
              <a href="#recuperar" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="hyper-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Validando...' : 'Acceder al Sistema'}</span>
              <span className="arrow">→</span>
            </button>
          </form>

          <button className="back-btn" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </main>
      </div>
    </div>
  );
};

export default Login;