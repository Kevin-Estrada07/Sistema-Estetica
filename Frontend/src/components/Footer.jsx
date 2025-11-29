import React from "react";
import { Facebook, Instagram, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import '../styles/Footer.css';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* Logo y descripción */}
          <div className="footer-section footer-brand">
            <img src="/images/logoglanz.png" alt="Glanz Estética" className="footer-logo" />
            <p className="footer-tagline">
              Más de 20 años resaltando tu belleza en Guadalajara
            </p>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/glanz.estetica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-link"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/glanzestetica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-link"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Menú Principal */}
          <div className="footer-section">
            <h3 className="footer-title">Menú Principal</h3>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Inicio</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>Nuestra Historia</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Servicios</a></li>
              <li><a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('products'); }}>Productos</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contacto</a></li>
            </ul>
          </div>

          {/* Horario de Atención */}
          <div className="footer-section">
            <h3 className="footer-title">Horario de Atención</h3>
            <div className="footer-schedule">
              <div className="schedule-item">
                <Clock size={16} />
                <div>
                  <p className="schedule-day">Lunes a Viernes</p>
                  <p className="schedule-time">9:00 AM - 7:00 PM</p>
                </div>
              </div>
              <div className="schedule-item">
                <Clock size={16} />
                <div>
                  <p className="schedule-day">Sábados</p>
                  <p className="schedule-time">9:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="footer-section">
            <h3 className="footer-title">Contáctanos</h3>
            <ul className="footer-contact">
              <li>
                <Phone size={16} />
                <a href="tel:+523331232589">33 3123 2589</a>
              </li>
              <li>
                <MessageCircle size={16} />
                <a href="https://wa.me/523329438598" target="_blank" rel="noopener noreferrer">
                  33 2943 8598 (WhatsApp)
                </a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Guadalajara, Jalisco</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p>© 2025 Glanz Estética | Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
