import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { testimoniosAPI } from '../api/testimoniosAPI';

const Testimonials = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [formData, setFormData] = useState({
    nombre: '',
    comentario: '',
    calificacion: 5
  });

  // Cargar testimonios al montar el componente
  useEffect(() => {
    fetchTestimonios();
  }, []);

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      const response = await testimoniosAPI.getDestacados();
      setComments(response.data);
    } catch (error) {
      console.error('Error al cargar testimonios:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    const s = new Set(expandedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedIds(new Set(s));
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.comentario.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      await testimoniosAPI.create(formData);

      alert('¡Gracias por tu comentario! Será visible después de la aprobación.');
      setFormData({ nombre: '', comentario: '', calificacion: 5 });

      // Opcional: recargar testimonios para mostrar los aprobados
      // fetchTestimonios();
    } catch (error) {
      console.error('Error al enviar testimonio:', error);
      alert('Error al enviar el comentario. Por favor intenta de nuevo.');
    }
  };

  const StarRating = ({ rating, interactive, onChange }) => {
    return (
      <div className="testimonial-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star-icon ${star <= rating ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className="testimonials">
      <div className="testimonials-header-section">
        <h2 className="testimonials-title">Comentarios de Nuestras Clientas</h2>
        <p className="testimonials-subtitle">
          Comparte tu experiencia con nosotros
        </p>
      </div>

      <div className="testimonials-container">
        <div className="comment-form-wrapper">
          <h3 className="comment-form-title">
            <Send className="form-icon" />
            Deja tu Comentario
          </h3>

          <div className="comment-form">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="form-input"
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comentario</label>
              <textarea
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                rows={4}
                className="form-textarea"
                placeholder="Cuéntanos sobre tu experiencia..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Calificación</label>
              <StarRating
                rating={formData.calificacion}
                interactive={true}
                onChange={(calificacion) => setFormData({ ...formData, calificacion })}
              />
            </div>

            <button onClick={handleSubmit} className="submit-button">
              <Send className="button-icon" />
              Publicar Comentario
            </button>
          </div>
        </div>

        <div className="comments-section">
          <h3 className="comments-count">
            Testimonios Destacados ({comments.length})
          </h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
              Cargando comentarios...
            </p>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
              Aún no hay comentarios. ¡Sé el primero en compartir tu experiencia!
            </p>
          ) : (
            <div className="testimonials-grid">
              {comments.map((comment) => {
                const fecha = new Date(comment.created_at);
                const fechaFormateada = fecha.toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={comment.id} className={`testimonial-card ${expandedIds.has(comment.id) ? 'expanded' : ''}`}>
                    <div className="testimonial-header">
                      <div className="avatar-wrapper">
                        <img
                          src={comment.avatar}
                          alt={comment.nombre}
                          className="testimonial-avatar"
                        />
                      </div>

                      <div className="testimonial-info">
                        <h4 className="testimonial-name">{comment.nombre}</h4>
                        <p className="testimonial-date">{fechaFormateada}</p>
                      </div>
                    </div>

                    <StarRating rating={comment.calificacion} interactive={false} />

                    <div className={`testimonial-comment-wrapper ${expandedIds.has(comment.id) ? 'expanded' : ''}`}>
                      <p className="testimonial-comment">"{comment.comentario}"</p>
                    </div>
                    {comment.comentario.length > 80 && (
                      <button className="read-more-btn" onClick={() => toggleExpand(comment.id)}>
                        {expandedIds.has(comment.id) ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;