import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [toast, setToast] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.name || !formData.message) {
      showToast('❌ Por favor completa todos los campos requeridos');
      return;
    }

    // Crear mensaje para WhatsApp
    const phoneNumber = "523329438598";
    let message = `Hola, soy ${formData.name}.\n\n`;
    message += `${formData.message}\n\n`;
    if (formData.email) {
      message += `Email: ${formData.email}\n`;
    }
    if (formData.phone) {
      message += `Teléfono: ${formData.phone}`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToast('✅ Redirigiendo a WhatsApp...');

    // Limpiar formulario
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <>
      <Header />
      <div className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-container">
            <span className="contact-badge">Contáctanos</span>
            <h1 className="contact-hero-title">¿Tienes Preguntas?</h1>
            <p className="contact-hero-subtitle">Estamos aquí para atenderte. Comparte tus consultas o agenda tu cita con nosotros</p>
          </div>
        </section>

        <section className="contact-content">
          <div className="contact-container">
            {/* Información de Contacto */}
            <div className="contact-info">
              <h2>Información de Contacto</h2>
              <p className="contact-intro">
                Visítanos o comunícate con nosotros. Estamos listos para atenderte.
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <Phone size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Teléfono</h3>
                    <a href="tel:+523331232589">33 3123 2589</a>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="info-content">
                    <h3>WhatsApp</h3>
                    <a href="https://wa.me/523329438598" target="_blank" rel="noopener noreferrer">
                      33 2943 8598
                    </a>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Ubicación</h3>
                    <p>Guadalajara, Jalisco</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Clock size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Horario</h3>
                    <p>Lun - Vie: 9:00 AM - 7:00 PM</p>
                    <p>Sábados: 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.7267!2d-103.3496!3d20.6597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDM5JzM1LjAiTiAxMDPCsDIwJzU4LjYiVw!5e0!3m2!1ses!2smx!4v1234567890"
                  width="100%"
                  height="350"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Glanz Estética"
                ></iframe>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="contact-form-wrapper">
              <h2>Envíanos un Mensaje</h2>
              <p className="form-intro">
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="33 1234 5678"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensaje *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquí..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <Send size={18} />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
      <Footer />
    </>
  );
};

export default Contact;

