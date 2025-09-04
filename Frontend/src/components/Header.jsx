import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
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

  return (
    <>
      <header className={`header ${hideHeader ? "hidden" : ""}`}>
        <div className='logo'>
          <h1>Estética Bella</h1>
        </div>

        <nav className={`nav ${isOpen ? 'open' : ''}`}>
          <a href="#services" onClick={() => setIsOpen(false)}>Conexión</a>
          <a href="#services" onClick={() => setIsOpen(false)}>Servicios</a>
          <a href="#appointment" onClick={() => setIsOpen(false)}>Agendar Cita</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>Contacto</a>
          {/* Botón login modal */}
          <button
            className="login-button-header"
            onClick={() => { setShowLogin(true); setIsOpen(false); }}
          >
            Iniciar Sesión
          </button>
        </nav>

        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Modal Login */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
