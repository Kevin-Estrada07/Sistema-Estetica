// Services.jsx
import React from 'react';

const services = [
  { id: 1, title: 'Corte de cabello', description: 'Estilo y corte a la moda.' },
  { id: 2, title: 'Manicure y pedicure', description: 'Uñas perfectas y cuidadas.' },
  { id: 3, title: 'Tratamientos faciales', description: 'Renueva tu piel.' },
];

const Services = () => (
  <section id="services" >
    <h2>Nuestros Servicios</h2>
    <div>
      {services.map(service => (
        <div key={service.id} className='service-card'>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
