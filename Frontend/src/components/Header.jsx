import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../pages/Login';

const Header = () => {
  const navigate = useNavigate();
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

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`header ${hideHeader ? "hidden" : ""}`}>
        <div className='container'>
          <div className='logo' onClick={scrollToTop} style={{ cursor: 'pointer' }}>
            <img src="/images/logoglanz.png" alt="Logo Glanz Estética" />
          </div>

          <nav className={`nav ${isOpen ? 'open' : ''}`}>
            <div className="nav-overlay" onClick={() => setIsOpen(false)}></div>
            <div className="nav-content">
              <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}>
                <span>Inicio</span>
              </a>
              <a href="/nuestra-historia" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavigation('/nuestra-historia'); }}>
                <span>Nuestra Historia</span>
              </a>
              <a href="/servicios" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavigation('/servicios'); }}>
                <span>Servicios</span>
              </a>
              <a href="/productos" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavigation('/productos'); }}>
                <span>Productos</span>
              </a>
              <a href="/contacto" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavigation('/contacto'); }}>
                <span>Contacto</span>
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