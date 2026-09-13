import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Home.css';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-wrapper">
      {/* Efectos de luz hiper-animados */}
      <div className="glow green-glow pulse-extreme"></div>
      <div className="glow blue-glow pulse-extreme-alt"></div>
      <div className="dragon-scales-overlay animate-pan"></div>

      {/* ============ NAVBAR ============ */}
      <header className={`home-nav ${scrolled ? 'scrolled' : ''} animate-fade-down`}>
        <div className="brand-logo">
          <img src="/logo-dragon.png" alt="Logo Dragón" className="dragon-img-logo float-anim" />
          <div className="brand-text">
            Elder <span className="signature-text neon-text">Dragón</span> <span>Fitness</span>
          </div>
        </div>
        <nav className="nav-menu">
          
          <a href="#zonas" className="hover-underline">Zonas</a>
          <a href="#ubicacion" className="hover-underline">Ubicación</a>
          <button className="login-btn neon-border" onClick={() => navigate('/login')}>
            Portal de Acceso
          </button>
        </nav>
      </header>

      {/* ============ HERO (DISEÑO CENTRADO CON MENSAJITOS) ============ */}
      <main className="hero-section">
        
        {/* Brillo central detrás del texto */}
        <div className="dragon-orb core-pulsar"></div>

        {/* Tarjetas flotantes (Mensajitos) */}
        <div className="floating-card card-1 card-3d">
          <span className="card-icon">💲</span>
          <div><h4>Control de Pagos</h4><p>Membresía al día</p></div>
        </div>
        
        <div className="floating-card card-2 card-3d">
          <span className="card-icon">📈</span>
          <div><h4>Métricas</h4><p>Progreso físico</p></div>
        </div>

        <div className="floating-card card-3 card-3d">
          <span className="card-icon">📱</span>
          <div><h4>Rutinas</h4><p>100% Digitales</p></div>
        </div>

        <div className="floating-card card-4 card-3d">
          <span className="card-icon">🔒</span>
          <div><h4>Seguridad</h4><p>Acceso por roles</p></div>
        </div>

        {/* Contenido Central */}
        <div className="hero-content animate-stagger">
          <span className="hero-badge glitch-badge">🔥 Sistema de Gestión y Entrenamiento</span>
          <h1 className="hero-title title-3d">
            Despierta al <br/>
            <span className="signature-text gradient-text">Dragón</span> que llevas <br/>
            dentro
          </h1>
          <p className="hero-subtitle">
            Controla tu membresía, sigue tus rutinas digitales y alcanza tu mejor versión. 
            Disciplina forjada en hierro y tecnología.
          </p>
          <div className="hero-actions">
            <button className="primary-cta hyper-btn" onClick={() => navigate('/login')}>
              <span className="btn-text">Comienza tu legado</span> <span className="arrow">→</span>
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat float-stat-1"><h3>+5K</h3><p>Clientes</p></div>
            <div className="stat float-stat-2"><h3>+5</h3><p>Entrenadores</p></div>
            <div className="stat float-stat-3"><h3>24/7</h3><p>Control</p></div>
          </div>
        </div>
      </main>

      {/* ============ ZONAS DEL GYM ============ */}
      <section className="gym-zones-section" id="zonas">
        <div className="section-header animate-on-scroll">
          <span className="section-badge">💪 Nuestras Instalaciones</span>
          <h2>Forja tu cuerpo en <span className="signature-text gradient-text">zonas de élite</span></h2>
        </div>
        <div className="features-section">
          <div className="feature extreme-card">
            <div className="feature-icon neon-icon">🏋️‍♂️</div>
            <h3>Musculación y Peso Libre</h3>
            <p>Mancuernas hasta 150lbs, racks de sentadilla olímpicos y bancos de alta resistencia para hipertrofia pura.</p>
          </div>
          <div className="feature extreme-card">
            <div className="feature-icon neon-icon">🏃‍♂️</div>
            <h3>Cardio Extremo</h3>
            <p>Caminadoras curvas, remadoras de aire y elípticas de última generación para llevar tu resistencia al límite.</p>
          </div>
          <div className="feature extreme-card">
            <div className="feature-icon neon-icon">🔥</div>
            <h3>Cross-Training & Funcional</h3>
            <p>Jaulas funcionales, pesas rusas y cajas pliométricas diseñadas para acondicionamiento metabólico.</p>
          </div>
        </div>
      </section>

      {/* ============ UBICACIÓN Y CONTACTO ============ */}
      <section className="info-section" id="ubicacion">
        <div className="section-header">
          <span className="section-badge">📍 Visítanos</span>
          <h2>Encuentra tu <span className="signature-text gradient-text">templo de poder</span></h2>
        </div>

        <div className="location-grid">
          <div className="location-card-modern hover-3d-container">
            <div className="modern-info-item">
              <div className="modern-icon" style={{color: '#ff4d85'}}>📍</div>
              <div className="modern-text">
                <h4 style={{color: '#38d996'}}>Dirección</h4>
                <p>Universidad Católica de El Salvador<br />Santa Ana, El Salvador</p>
              </div>
            </div>
            
            <div className="modern-info-item">
              <div className="modern-icon" style={{color: '#b8c2d6'}}>🕒</div>
              <div className="modern-text">
                <h4 style={{color: '#38d996'}}>Horarios</h4>
                <p>
                  <strong>Lun - Vie:</strong> 5:00 AM - 11:00 PM<br />
                  <strong>Fines de Semana:</strong> 6:00 AM - 9:00 PM
                </p>
              </div>
            </div>
            
            <div className="modern-info-item">
              <div className="modern-icon" style={{color: '#ff6b6b'}}>📞</div>
              <div className="modern-text">
                <h4 style={{color: '#38d996'}}>Contacto Directo</h4>
                <p>+503 2440-1234<br />admin@elderdragon.com</p>
              </div>
            </div>
            
            <div className="modern-socials">
              <div className="social-pill">
                <a href="#facebook" aria-label="Facebook" className="social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <span className="social-handle">@ElderDragonSV</span>
              </div>
              <div className="social-pill">
                <a href="#instagram" aria-label="Instagram" className="social-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <span className="social-handle">@ElderDragonSV</span>
              </div>
            </div>
          </div>

          {/* Iframe de la UNICAES */}
          <div className="location-map map-glitch-hover">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.596340268887!2d-89.55097678927756!3d13.98261619185108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f62e62036825a69%3A0xec68b49f92513893!2sUniversidad%20Catolica%20de%20El%20Salvador!5e0!3m2!1ses-419!2sus!4v1789107881353!5m2!1ses-419!2sus" 
              width="100%" height="100%" allowFullScreen="" loading="lazy" 
              referrerPolicy="strict-origin-when-cross-origin" title="Ubicación UNICAES">
            </iframe>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer animate-fade-up">
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Elder Dragón Fitness. Control Total.</p>
          <div className="footer-legal">
            <p>📍 Universidad Católica de El Salvador</p>
            <a href="tel:+50324401234">📞 +503 2440-1234</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;