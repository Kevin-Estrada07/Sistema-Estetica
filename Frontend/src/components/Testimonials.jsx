import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Ana P.",
    comment: "Excelente atención y resultados increíbles.",
    avatar: "/avatars/ana.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Luis M.",
    comment: "Muy profesional y ambiente relajante.",
    avatar: "/avatars/luis.jpg",
    rating: 4,
  },
  {
    id: 3,
    name: "Carla R.",
    comment: "Los mejores tratamientos faciales que he probado.",
    avatar: "/avatars/carla.jpg",
    rating: 5,
  },
];

const Testimonials = () => (
  <section id="testimonials" className="testimonials">
    <h2 className="testimonials-title">💖 Lo que dicen nuestros clientes</h2>
    <div className="testimonials-grid">
      {testimonials.map((t) => (
        <div key={t.id} className="testimonial-card">
          <div className="testimonial-header">
            <img
              src={t.avatar}
              alt={t.name}
              className="testimonial-avatar"
              onError={(e) =>
                (e.target.src =
                  "https://i.pravatar.cc/100?img=" + t.id) // fallback avatar
              }
            />
            <div>
              <h3 className="testimonial-name">{t.name}</h3>
              <div className="testimonial-stars">
                {"★".repeat(t.rating)}
                {"☆".repeat(5 - t.rating)}
              </div>
            </div>
          </div>
          <p className="testimonial-comment">“{t.comment}”</p>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
