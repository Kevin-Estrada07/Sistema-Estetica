import React, { useState } from "react";

const AppointmentForm = () => {
  const [form, setForm] = useState({ name: "", date: "", service: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const phone = "527331234567"; // Reemplaza con tu número en formato internacional (52 para MX)
    const message = `Hola, soy ${form.name}. Quiero agendar una cita para el servicio: ${form.service} el día ${form.date}.`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="appointment" className="appointment-section">
      <h2 className="appointment-title">📅 Agendar Cita</h2>

      <div className="appointment-container">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="appointment-form">
          <input
            name="name"
            placeholder="Nombre completo"
            value={form.name}
            onChange={handleChange}
            required/>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required/>
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            required>
            <option value="">Selecciona un servicio</option>
            <option value="Corte de cabello">Corte de cabello</option>
            <option value="Manicure y pedicure">Manicure y pedicure</option>
            <option value="Tratamientos faciales">Tratamientos faciales</option>
          </select>

          <button type="submit" className="btn-whatsapp">
            💬 Agendar por WhatsApp
          </button>

          <p className="direct-contact">
            O contáctanos directamente:{" "}
            <a href="tel:+527331169380">📞 Llamar: 73331234567</a> {" "} <br />
            <a href="estetica.bella@email.com">✉️ Correo: estetica.bella@email.com</a>
          </p>
        </form> 

        {/* Mapa */}
        <div className="appointment-map">
          <iframe
            title="Ubicación Estética Bella"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.563083960256!2d-99.1332084!3d19.4326077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f92e8f9f1f7d%3A0x8b8b4b2f3c7e88a0!2sCDMX!5e0!3m2!1ses!2smx!4v1695656923456"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default AppointmentForm;
