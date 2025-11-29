import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AboutUsPreview.css';

const AboutUsPreview = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="about-preview-section">
      <div className="about-preview-container">
        <div className="about-preview-content">
          <span className="about-preview-badge">Guadalajara desde 1997</span>
          <h2 className="about-preview-title">Nuestra Historia</h2>
          <p className="about-preview-description">
            Más de 20 años resaltando la belleza y promoviendo el cuidado y bienestar del cabello.
          </p>
          <button 
            className="about-preview-btn"
            onClick={() => navigate('/nuestra-historia')}
          >
            Leer Más
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUsPreview;

