import React from "react";

const HeroSection = () => (
  <section className="hero">
    {/* Fondo con floating elements */}
    <div className="hero-background">
      <div className="floating-element element-1"></div>
      <div className="floating-element element-2"></div>
      <div className="floating-element element-3"></div>
      <div className="floating-element element-4"></div>
    </div>

    <div className="hero-container">
      {/* Texto principal */}
      <div className="hero-content">
        <span className="hero-badge">✨ Estética</span>

        <h1 className="hero-title">
          Resalta tu <span className="highlight">belleza</span> natural
        </h1>

        <p className="hero-subtitle">
          Vive una experiencia de bienestar única con nuestros tratamientos y servicios especializados, diseñados para ti.
        </p>

        <div className="hero-buttons">
          <button className="cta-primary">
            Reservar Cita
            <span className="shine"></span>
          </button>
          <button className="cta-secondary">Ver Servicios</button>
        </div>

        {/* Features */}
        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">💆‍♀️</div>
            <span>Faciales</span>
          </div>
          <div className="feature">
            <div className="feature-icon">💅</div>
            <span>Uñas</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🧘‍♀️</div>
            <span>Relajación</span>
          </div>
        </div>
      </div>

      {/* Imagen o ilustración */}
      <div className="hero-image">
        <img src="/images/hero-image.jpg" alt="Belleza y bienestar" className="hero-img" />
      </div>
    </div>
  </section>
);

export default HeroSection;
