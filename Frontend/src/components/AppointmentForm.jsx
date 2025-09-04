// AppointmentForm.jsx
import React, { useState } from 'react';

const AppointmentForm = () => {
  const [form, setForm] = useState({ name: '', email: '', date: '', service: '' });

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Cita agendada para ${form.name} en el servicio ${form.service} el día ${form.date}`);
  };

  return (
    <section id="appointment" style={{padding: '2rem', backgroundColor: '#f8e8e8'}}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#d47ea2'}}>Agendar Cita</h2>
      <form onSubmit={handleSubmit} className='appointment-form'>
        <input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required style={{padding: '0.5rem'}} />
        <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required style={{padding: '0.5rem'}} />
        <input type="date" name="date" value={form.date} onChange={handleChange} required style={{padding: '0.5rem'}} />
        <select name="service" value={form.service} onChange={handleChange} required style={{padding: '0.5rem'}}>
          <option value="">Selecciona un servicio</option>
          <option value="Corte de cabello">Corte de cabello</option>
          <option value="Manicure y pedicure">Manicure y pedicure</option>
          <option value="Tratamientos faciales">Tratamientos faciales</option>
        </select>
        <button type="submit" style={{backgroundColor: '#d47ea2', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Enviar</button>
      </form>
    </section>
  );
};

export default AppointmentForm;
