// Testimonials.jsx
import React from 'react';

const testimonials = [
  { id: 1, name: 'Ana P.', comment: 'Excelente atención y resultados increíbles.' },
  { id: 2, name: 'Luis M.', comment: 'Muy profesional y ambiente relajante.' },
];

const Testimonials = () => (
  <section className='testimonials'>
    <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#d47ea2'}}>Testimonios</h2>
    <div className='testimonial-block'>
      {testimonials.map(t => (
        <blockquote key={t.id} style={{marginBottom: '1rem', borderLeft: '4px solid #a85b7f', paddingLeft: '1rem', fontStyle: 'italic'}}>
          <p>"{t.comment}"</p>
          <footer style={{textAlign: 'right', fontWeight: 'bold'}}>- {t.name}</footer>
        </blockquote>
      ))}
    </div>
  </section>
);

export default Testimonials;
