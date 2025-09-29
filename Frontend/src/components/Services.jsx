import React from "react";
import "../styles/Services.css";

const services = [
  {
    id: 1,
    title: "Corte de cabello",
    description: "Estilo y corte a la moda.",
    image: "/images/Corte-cabello.jpg",
    icon: "💇‍♀️"
  },
  {
    id: 2,
    title: "Manicure y pedicure",
    description: "Uñas perfectas y cuidadas.",
    image: "/images/Manicure.png",
    icon: "💅"
  },
  {
    id: 3,
    title: "Tratamientos faciales",
    description: "Renueva tu piel.",
    image: "/images/facial.png",
    icon: "🌸"
  },
];

const Services = () => (
  <section id="services" className="services">
    <h2 className="services-title">✨ Nuestros Servicios ✨</h2>
    <div className="services-grid">
      {services.map((service) => (
        <div key={service.id} className="service-card">
          <div
            className="service-bg"
            style={{ backgroundImage: `url(${service.image})` }}
          >
            <div className="overlay"></div>
          </div>
          <div className="service-content">
            <span className="service-icon">{service.icon}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
