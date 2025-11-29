import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ServicesPreview.css';

const ServicesPreview = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="services-preview-section">
      <div className="services-preview-container">
        <div className="services-preview-header">
          <span className="services-preview-badge">Visítanos</span>
          <h2 className="services-preview-title">Agenda tu Cita</h2>
          <p className="services-preview-subtitle">
            Conoce nuestro horario de atención y agenda tu cita para servicio o valoración, será un placer atenderte.
          </p>
        </div>

        <div className="services-preview-grid">
          <div className="service-preview-card">
            <div className="service-preview-icon">
              <img src="/images/color-icon.svg" alt="Color" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 3rem; color: var(--primary);">🎨</div>';
                }}
              />
            </div>
            <h3>Color</h3>
          </div>

          <div className="service-preview-card">
            <div className="service-preview-icon">
              <img src="/images/corte-icon.svg" alt="Corte"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 3rem; color: var(--primary);">✂️</div>';
                }}
              />
            </div>
            <h3>Corte</h3>
          </div>

          <div className="service-preview-card">
            <div className="service-preview-icon">
              <img src="/images/makeup-icon.svg" alt="Make-up"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 3rem; color: var(--primary);">💄</div>';
                }}
              />
            </div>
            <h3>Make-up</h3>
          </div>
        </div>

        <button 
          className="services-preview-btn"
          onClick={() => navigate('/servicios')}
        >
          Ver Todos los Servicios
        </button>
      </div>
    </section>
  );
};

export default ServicesPreview;

