import React, { useState, useEffect } from 'react';
import Login from '../pages/Login';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`header ${hideHeader ? "hidden" : ""}`}>
        <div className='container'>
          <div className='logo' onClick={scrollToTop} style={{ cursor: 'pointer' }}>
            {/* Puedes reemplazar esto con <img src="/ruta-al-logo.png" alt="Logo Estética Bella" /> */}
            {/* <h1>
              <span className="logo-main">Estética</span>
              <span className="logo-accent">Bella</span>
            </h1> */}
            <img src="/images/logoglanz.png" alt="Logo Estética Bella" />
            <div className="logo-underline"></div>
          </div>

          <nav className={`nav ${isOpen ? 'open' : ''}`}>
            <div className="nav-overlay" onClick={() => setIsOpen(false)}></div>
            <div className="nav-content">
              {/* <a href="#services" className="nav-link" onClick={() => setIsOpen(false)}>
                <span>Conexión</span>
              </a> */}
               <a href="#services" className="nav-link" onClick={() => setIsOpen(false)}>
                <span>Servicios</span>
              </a>
              <a href="#appointment" className="nav-link" onClick={() => setIsOpen(false)}>
                <span>Agendar Cita</span>
              </a>
              <a href="#testimonials" className="nav-link" onClick={() => setIsOpen(false)}>
                <span>Opiniones</span>
              </a>
              <button
                className="login-button-header"
                onClick={() => { setShowLogin(true); setIsOpen(false); }}>
                <span className="button-text">Iniciar Sesión</span>
                <div className="button-glow"></div>
              </button>
            </div>
          </nav>

          <button
            className={`hamburger ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú"
          >
            <div className="hamburger-box">
              <div className="hamburger-inner">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Modal Login */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;