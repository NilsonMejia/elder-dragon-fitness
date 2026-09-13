import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intentando iniciar sesión con:', { email, password, remember });
    // Aquí conectaremos con el backend en Node.js[cite: 1]
  };

  return (
    <div className="login-wrapper">
      {/* Fondo inmersivo */}
      <div className="glow green-glow pulse-extreme"></div>
      <div className="glow blue-glow pulse-extreme-alt"></div>
      <div className="dragon-scales-overlay animate-pan"></div>

      <div className="login-container">
        
        {/* ============ LADO IZQUIERDO: BRANDING ORDENADO ============ */}
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
            <li><span>🔥</span> Rutinas personalizadas</li>
            <li><span>📊</span> Seguimiento de progreso</li>
            <li><span>🏆</span> Comunidad de élite</li>
          </ul>

          <div className="brand-footer">
            <p>© {new Date().getFullYear()} Elder Dragón Fitness</p>
          </div>
        </aside>

        {/* ============ LADO DERECHO: FORMULARIO LIMPIO ============ */}
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
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@elderdragon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
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

            <button type="submit" className="hyper-btn">
              <span>Acceder al Sistema</span>
              <span className="arrow">→</span>
            </button>
          </form>

          {/* El botón de crear cuenta fue eliminado completamente de aquí */}

          <button className="back-btn" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </main>
      </div>
    </div>
  );
};

export default Login;