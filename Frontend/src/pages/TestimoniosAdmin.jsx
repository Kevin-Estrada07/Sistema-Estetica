import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { testimoniosAPI } from '../api/testimoniosAPI';
import '../styles/TestimoniosAdmin.css';

const TestimoniosAdmin = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, pendientes, aprobados, destacados
  const [modalTestimonio, setModalTestimonio] = useState(null); 

  useEffect(() => {
    fetchTestimonios();
  }, []);

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      const response = await testimoniosAPI.getTodos();
      setTestimonios(response.data);
    } catch (error) {
      console.error('Error al cargar testimonios:', error);
      alert('Error al cargar testimonios');
    } finally {
      setLoading(false);
    }
  };

  const aprobarTestimonio = async (id) => {
    try {
      await testimoniosAPI.aprobar(id);
      fetchTestimonios();
    } catch (error) {
      console.error('Error al aprobar testimonio:', error);
      alert('Error al aprobar testimonio');
    }
  };

  const destacarTestimonio = async (id) => {
    try {
      await testimoniosAPI.destacar(id);
      fetchTestimonios();
    } catch (error) {
      console.error('Error al destacar testimonio:', error);
      alert('Error al destacar testimonio');
    }
  };

  const eliminarTestimonio = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) {
      return;
    }

    try {
      await testimoniosAPI.delete(id);
      fetchTestimonios();
    } catch (error) {
      console.error('Error al eliminar testimonio:', error);
      alert('Error al eliminar testimonio');
    }
  };

  const testimoniosFiltrados = testimonios.filter(t => {
    if (filter === 'pendientes') return !t.aprobado;
    if (filter === 'aprobados') return t.aprobado;
    if (filter === 'destacados') return t.destacado;
    return true; // todos
  });

  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#fbbf24' : 'none'}
            stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <header className="headerDashboard">
          <h1 className="page-title">Gestión de Testimonios</h1>
        </header>

        <div className="testimonios-admin-container">
          {/* Filtros */}
          <div className="filters-section">
            <button
              className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
              onClick={() => setFilter('todos')}
            >
              Todos ({testimonios.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pendientes' ? 'active' : ''}`}
              onClick={() => setFilter('pendientes')}
            >
              Pendientes ({testimonios.filter(t => !t.aprobado).length})
            </button>
            <button
              className={`filter-btn ${filter === 'aprobados' ? 'active' : ''}`}
              onClick={() => setFilter('aprobados')}
            >
              Aprobados ({testimonios.filter(t => t.aprobado).length})
            </button>
            <button
              className={`filter-btn ${filter === 'destacados' ? 'active' : ''}`}
              onClick={() => setFilter('destacados')}
            >
              Destacados ({testimonios.filter(t => t.destacado).length})
            </button>
          </div>

          {/* Tabla de testimonios */}
          {loading ? (
            <p className="loading-text">Cargando testimonios...</p>
          ) : testimoniosFiltrados.length === 0 ? (
            <p className="empty-text">No hay testimonios en esta categoría</p>
          ) : (
            <div className="testimonios-table-wrapper">
              <table className="testimonios-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Nombre</th>
                    <th>Comentario</th>
                    <th>Calificación</th>
                    <th>Estado</th>
                    <th>Destacado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {testimoniosFiltrados.map((testimonio) => {
                    const fecha = new Date(testimonio.created_at);
                    const fechaFormateada = fecha.toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={testimonio.id} className={!testimonio.aprobado ? 'pendiente' : ''}>
                        <td>
                          <img
                            src={testimonio.avatar}
                            alt={testimonio.nombre}
                            className="avatar-small"
                          />
                        </td>
                        <td className="nombre-cell">{testimonio.nombre}</td>
                        <td
                          className="comentario-cell clickable"
                          onClick={() => setModalTestimonio(testimonio)}
                          title="Click para ver comentario completo"
                        >
                          <div>
                            {testimonio.comentario.length > 80
                              ? `${testimonio.comentario.substring(0, 80)}...`
                              : testimonio.comentario}
                          </div>
                        </td>
                        <td>
                          <StarRating rating={testimonio.calificacion} />
                        </td>
                        <td>
                          <span className={`badge ${testimonio.aprobado ? 'badge-success' : 'badge-warning'}`}>
                            {testimonio.aprobado ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${testimonio.destacado ? 'badge-featured' : 'badge-normal'}`}>
                            {testimonio.destacado ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="fecha-cell">{fechaFormateada}</td>
                        <td>
                          <div className="actions-cell">
                            {!testimonio.aprobado && (
                              <button
                                className="action-btn btn-approve"
                                onClick={() => aprobarTestimonio(testimonio.id)}
                                title="Aprobar"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              className={`action-btn ${testimonio.destacado ? 'btn-featured' : 'btn-feature'}`}
                              onClick={() => destacarTestimonio(testimonio.id)}
                              title={testimonio.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                            >
                              <Award size={14} />
                            </button>
                            <button
                              className="action-btn btn-delete"
                              onClick={() => eliminarTestimonio(testimonio.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para ver comentario completo */}
        {modalTestimonio && (
          <div className="modal-overlay" onClick={() => setModalTestimonio(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-user-info">
                  <img
                    src={modalTestimonio.avatar}
                    alt={modalTestimonio.nombre}
                    className="modal-avatar"
                  />
                  <div>
                    <h3>{modalTestimonio.nombre}</h3>
                    <StarRating rating={modalTestimonio.calificacion} />
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setModalTestimonio(null)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-comment">{modalTestimonio.comentario}</p>
              </div>
              <div className="modal-footer-testimonios">
                <span className={`badge ${modalTestimonio.aprobado ? 'badge-success' : 'badge-warning'}`}>
                  {modalTestimonio.aprobado ? 'Aprobado' : 'Pendiente'}
                </span>
                {modalTestimonio.destacado && (
                  <span className="badge badge-featured">Destacado</span>
                )}
                <span className="modal-date">
                  {new Date(modalTestimonio.created_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestimoniosAdmin;

