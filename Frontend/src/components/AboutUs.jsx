import React from 'react';
import { Heart } from 'lucide-react';
import '../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* Header Principal */}
        <div className="about-header">
          <span className="about-badge">Guadalajara desde 1997</span>
          <h1 className="about-main-title">Nuestra Historia</h1>
          <p className="about-intro">
            Glanz nace <strong>un primero de Enero de 1997</strong> con el sueño de ser un espacio agradable
            con herramientas necesarias para crear, estar a la vanguardia en la moda, contar con capital
            humano capacitado para integrarnos con sus deseos, buscando las mejores técnicas y opciones
            de acuerdo a sus necesidades.
          </p>
          <p className="about-note">
            <Heart size={18} />
            Más de 25 años resaltando la belleza y promoviendo el cuidado del cabello
          </p>
        </div>

        {/* Sección Misión y Visión */}
        <div className="mission-vision-section">
          {/* Misión */}
          <div className="mission-box">
            <h2 className="box-title">Misión</h2>
            <p className="box-text">
              Ser un asesor de imagen integral, aplicando técnicas y procesos innovadores,
              utilizando productos de calidad. En Glanz trabajamos con el cliente para encontrar
              los mejores productos para el cuidado de su cabello de acuerdo a su estilo y sus necesidades.
            </p>
          </div>

          {/* Visión */}
          <div className="vision-box">
            <h2 className="box-title">Visión</h2>
            <p className="box-text">
              Consolidarnos como una empresa que contribuya al embellecimiento de las personas,
              a través de servicios de calidad. Buscando siempre la actualización constante de
              las tendencias de la Industria.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

