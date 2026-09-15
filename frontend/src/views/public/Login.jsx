import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const roleRedirects = {
  Administrador: '/admin/dashboard',
  Recepcionista: '/recepcion/clientes',
  Entrenador: '/admin/dashboard',
  Cliente: '/cliente/perfil',
};

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

// NUEVOS ICONOS SVG PARA REEMPLAZAR @ Y 🔒
const MailIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState({ email: '', tempPassword: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
    setEmail('');
    setPassword('');
    setPendingCredentials({ email: '', tempPassword: '' });
  }, []);

  const saveSessionAndRedirect = (data) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('usuario', JSON.stringify(data.usuario));

    navigate(roleRedirects[data.usuario.rol] || '/', { replace: true });
  };

  const parseResponse = async (response) => {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  };

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

      const data = await parseResponse(response);

      if (response.status === 403 && data.requirePasswordChange) {
        setPendingCredentials({
          email: data.email || email,
          tempPassword: password,
        });
        setRequiresPasswordChange(true);
        setPassword('');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesion.');
      }

      saveSessionAndRedirect(data);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('La nueva contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/cambiar-password-inicial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingCredentials.email,
          tempPassword: pendingCredentials.tempPassword,
          newPassword,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar la contrasena.');
      }

      saveSessionAndRedirect(data);
    } catch (passwordChangeError) {
      setError(passwordChangeError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresPasswordChange(false);
    setPendingCredentials({ email: '', tempPassword: '' });
    setNewPassword('');
    setConfirmPassword('');
    setError('');
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
                alt="Logo Dragon"
                className="dragon-img-logo float-anim"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <h1 className="brand-title">
              Elder <span className="signature-text neon-text">Dragon</span>
            </h1>

            <p className="brand-tagline">
              Despierta tu fuerza. <br />
              Domina tu disciplina.
            </p>
          </div>

          <ul className="brand-features">
            <li><span>✓</span> Rutinas personalizadas</li>
            <li><span>✓</span> Seguimiento de progreso</li>
            <li><span>✓</span> Comunidad de elite</li>
          </ul>

          <div className="brand-footer">
            <p>© {new Date().getFullYear()} Elder Dragon Fitness</p>
          </div>
        </aside>

        <main className="login-card-extreme animate-fade-up">
          <header className="login-header">
            <span className="login-chip">
              {requiresPasswordChange ? 'Primer acceso' : 'Acceso de miembros'}
            </span>
            <h2 className="login-title">
              {requiresPasswordChange ? 'Actualiza tu contrasena' : 'Bienvenido de vuelta'}
            </h2>
            <p className="login-subtitle">
              {requiresPasswordChange
                ? 'Crea una contrasena definitiva para proteger tu cuenta.'
                : 'Ingresa tus credenciales para continuar tu entrenamiento.'}
            </p>
          </header>

          {requiresPasswordChange ? (
            <form className="login-form password-change-form" onSubmit={handlePasswordChangeSubmit}>
              <div className="password-change-notice">
                <span className="notice-dot"></span>
                <p>
                  Detectamos una contrasena temporal para{' '}
                  <strong>{pendingCredentials.email}</strong>.
                </p>
              </div>

              <div className="input-group">
                <label htmlFor="newPassword">Nueva Contrasena</label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon size={18} /></span>
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Minimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
                  >
                    {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Contrasena</label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon size={18} /></span>
                  <input
                    id="confirmPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Repite tu nueva contrasena"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="hyper-btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Guardando...' : 'Guardar y Entrar'}</span>
                <span className="arrow">→</span>
              </button>

              <button type="button" className="form-secondary-action" onClick={handleBackToLogin}>
                Usar otro usuario
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Correo Electronico</label>
                <div className="input-wrapper">
                  <span className="input-icon"><MailIcon size={18} /></span>
                  <input
                    id="email"
                    type="email"
                    placeholder="usuario@elderdragon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Contrasena</label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockIcon size={18} /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
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
                  <span>Recordar sesion</span>
                </label>
                <a href="#recuperar" className="forgot-password">
                  ¿Olvidaste tu contrasena?
                </a>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="hyper-btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Validando...' : 'Acceder al Sistema'}</span>
                <span className="arrow">→</span>
              </button>
            </form>
          )}

          <button className="back-btn" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </main>
      </div>
    </div>
  );
};

export default Login;