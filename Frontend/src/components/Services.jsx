import React from "react";
import { MapPin, Scissors } from "lucide-react";
import "../styles/ServicesPublic.css";

const servicesList = [
  { name: "CORTE DAMA", price: "$295.00 MXN" },
  { name: "CORTE CABALLERO", price: "$265.00 MXN" },
  { name: "CORTE NIÑO", price: "$265.00 MXN" },
  { name: "PEINADO DESDE", price: "$230.00 MXN" },
  { name: "RETOQUE DE TINTE", price: "$780.00 MXN" },
  { name: "TRATAMIENTOS DESDE", price: "$400.00 MXN" },
  { name: "MAQUILLAJE SOCIAL", price: "$515.00 MXN" },
];

const serviceImages = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
];

const Services = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "523329438598"; // Formato internacional sin + ni espacios
    const message = "Hola, me gustaría cotizar un servicio";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="services" className="services-section-new">
      {/* Header Section */}
      <div className="services-header-section">
        <div className="services-header-container">
          <span className="services-badge">Nuestros Servicios</span>
          <h2 className="services-title">Servicios Profesionales de Belleza</h2>
          <p className="services-subtitle">
            Nuestro salón es un espacio para crear y asesorar con servicios hechos a tu necesidad
          </p>
          <p className="services-note">
            <Scissors size={18} />
            Los precios pueden variar según el tipo de cabello y complejidad
          </p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="services-gallery">
        <div className="services-gallery-grid">
          {serviceImages.map((image, index) => (
            <div key={index} className="gallery-item">
              <img src={image} alt={`Servicio ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="services-pricing-section">
        <div className="pricing-container-centered">
          <h2 className="pricing-title">AGENDA TU CITA</h2>
          <p className="pricing-subtitle">
            Los precios pueden variar dependiendo del tipo de cabello, color o complejidad del servicio.
          </p>

          <div className="services-list">
            {servicesList.map((service, index) => (
              <div key={index} className="service-item">
                <span className="service-name">{service.name}</span>
                <span className="service-dots"></span>
                <span className="service-price">{service.price}</span>
              </div>
            ))}
          </div>

          <div className="pricing-actions">
            <button className="cotizar-btn" onClick={handleWhatsAppClick}>
              Cotizar servicio por WhatsApp
            </button>
            <p className="pricing-note">
              También puedes comunicarte por llamada al <strong>33 2943 8598</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="services-location-section">
        <div className="location-container">
          <div className="location-info">
            <h3 className="location-title">Visítanos</h3>
            <div className="location-address">
              <MapPin size={20} />
              <div>
                <p>Plaza del Sol, Local #31, Zona R</p>
                <p>Colonia: Ciudad del Sol</p>
              </div>
            </div>

            <div className="location-question">
              <h4>¿Plaza del Sol, en dónde?</h4>
              <p>
                Por el lado de López Mateos, entre Fabricas de Francia y el Hotel AC Marriott (Redonda).
                En el pasillo de las "Casas de Cambio".
              </p>
            </div>
          </div>

          <div className="location-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.0!2d-103.4!3d20.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDQyJzAwLjAiTiAxMDPCsDI0JzAwLjAiVw!5e0!3m2!1ses!2smx!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Glanz Estética"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
