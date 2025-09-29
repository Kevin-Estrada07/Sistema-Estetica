import React from "react";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      {/* Información de contacto */}
      <div className="footer-section">
        <h3>Contacto</h3>
        <p><Phone size={16} /> +52 123 456 7890</p>
        <p><Mail size={16} /> estetica.bella@email.com</p>
        <p><MapPin size={16} /> Calle Ejemplo #123, Ciudad Bella</p>
      </div>

      {/* Redes sociales */}
      <div className="footer-section">
        <h3>Síguenos</h3>
        <div className="social-icons">
          <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
          <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
        </div>
      </div>

      {/* Derechos reservados */}
      <div className="footer-section">
        <h3>Estética Bella</h3>
        <p>Tu belleza, nuestro arte 💖</p>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2025 Estética Bella. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
