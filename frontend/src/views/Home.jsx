import React, { useState, useEffect } from 'react';
import '../css/Home.css';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-wrapper">
      {/* Efectos de luz y escamas de dragón */}
      <div className="glow green-glow"></div>
      <div className="glow blue-glow"></div>
      <div className="dragon-scales-overlay"></div>

      {/* ============ NAVBAR CON NUEVO LOGO EXTERNO ============ */}
      <header className={`home-nav ${scrolled ? 'scrolled' : ''} animate-fade-down`}>
        <div className="brand-logo">
          {/* Logo del Dragón desde la URL proporcionada */}
          <img 
            src="https://png.pngtree.com/png-clipart/20201209/original/pngtree-cartoon-logo-dragon-design-png-image_5583196.jpg" 
            alt="Logo Dragón" 
            className="dragon-img-logo" 
          />
          <div className="brand-text">
            Elder <span className="signature-text">Dragón</span> <span>Fitness</span>
          </div>
        </div>
        <nav className="nav-menu">
          <a href="#rutinas">Rutinas</a>
          <a href="#ubicacion">Ubicación</a>
          <button className="login-btn">Portal de Acceso</button>
          <button className="cta-btn">Únete Ahora</button>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <main className="hero-section">
        <div className="hero-content animate-fade-up">
          <span className="hero-badge">🔥 Sistema de Gestión y Entrenamiento</span>
          <h1 className="hero-title">
            Despierta al <span className="signature-text gradient-text">Dragón</span> que llevas dentro
          </h1>
          <p className="hero-subtitle">
            Controla tu membresía, sigue tus rutinas digitales y alcanza tu mejor versión. 
            Disciplina forjada en hierro y tecnología.
          </p>
          <div className="hero-actions">
            <button className="primary-cta">
              Comienza tu legado <span className="arrow">→</span>
            </button>
            <button className="secondary-cta">▶ Conocer el Sistema</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><h3>+5K</h3><p>Atletas Activos</p></div>
            <div className="stat"><h3>+120</h3><p>Rutinas Digitales</p></div>
            <div className="stat"><h3>24/7</h3><p>Control Total</p></div>
          </div>
        </div>

        <div className="hero-visual animate-fade-left">
          <div className="floating-card card-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div><h4>Control de Pagos</h4><p>Membresía al día</p></div>
          </div>
          <div className="floating-card card-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <div><h4>Métricas</h4><p>Progreso físico</p></div>
          </div>
          <div className="dragon-orb"></div>
        </div>
      </main>

      {/* ============ FEATURES ============ */}
      <section className="features-section">
        <div className="feature">
          <div className="feature-icon">🏆</div>
          <h3>Entrenadores Certificados</h3>
          <p>Coaches con experiencia real en competencia y transformación física.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💻</div>
          <h3>Portal Web Digital</h3>
          <p>Sigue tus rutinas, progreso y pagos desde cualquier navegador sin descargar nada.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🕒</div>
          <h3>Abierto 24/7</h3>
          <p>Entrena cuando quieras. La disciplina no tiene horario.</p>
        </div>
      </section>

      {/* ============ UBICACIÓN Y CONTACTO CON MAPA ============ */}
      <section className="info-section" id="ubicacion">
        <div className="section-header">
          <span className="section-badge">📍 Visítanos</span>
          <h2>Encuentra tu <span className="signature-text gradient-text">templo de poder</span></h2>
          <p>Ven a conocer nuestras instalaciones. Te esperamos con una clase de prueba gratis.</p>
        </div>

        <div className="location-grid">
          {/* Tarjeta de Contacto Oscura */}
          <div className="location-card-modern">
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
                <p>
                  +503 2440-1234<br />
                  admin@elderdragon.com
                </p>
              </div>
            </div>
            
            {/* Redes Sociales */}
            <div className="modern-socials">
              <div className="social-pill">
                <a href="#facebook" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <span className="social-handle">@ElderDragonSV</span>
              </div>

              <div className="social-pill">
                <a href="#instagram" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <span className="social-handle">@ElderDragonSV</span>
              </div>
            </div>
          </div>

          {/* Nuevo Iframe proporcionado de Google Maps (UNICAES) */}
          <div className="location-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.596340268887!2d-89.55097678927756!3d13.98261619185108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f62e62036825a69%3A0xec68b49f92513893!2sUniversidad%20Catolica%20de%20El%20Salvador!5e0!3m2!1ses-419!2sus!4v1789107881353!5m2!1ses-419!2sus" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="strict-origin-when-cross-origin"
              title="Ubicación UNICAES"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Elder Dragón Fitness. Todos los derechos reservados.</p>
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