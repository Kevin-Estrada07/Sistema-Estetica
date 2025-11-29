import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import '../styles/ProductsPreview.css';

const ProductsPreview = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const products = [
    {
      id: 1,
      name: 'Masque Beurre Haute Nutrition',
      brand: 'Kérastase',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80'
    },
    {
      id: 2,
      name: 'Bain Densité',
      brand: 'Kérastase',
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80'
    },
    {
      id: 3,
      name: 'Blonde Plex Treatment',
      brand: 'Tec Italy',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&q=80'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="products" className="products-preview-section">
      <div className="products-preview-container">
        <div className="products-content-wrapper">
          {/* Carousel de Productos - Izquierda */}
          <div className="products-carousel-section">
            <div className="carousel-wrapper">
              <button className="carousel-btn prev" onClick={prevSlide} aria-label="Anterior">
                <ChevronLeft size={24} />
              </button>

              <div className="products-carousel">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ display: index === currentSlide ? 'block' : 'none' }}
                  >
                    <div className="carousel-item">
                      <img src={product.image} alt={product.name} />
                      <div className="carousel-info">
                        <h3>{product.name}</h3>
                        <p>{product.brand}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="carousel-btn next" onClick={nextSlide} aria-label="Siguiente">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Indicadores */}
            <div className="carousel-indicators">
              {products.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir a producto ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Información del Catálogo - Derecha */}
          <div className="catalog-info-section">
            <div className="catalog-icon-wrapper">
              <Package size={64} strokeWidth={1.5} />
            </div>

            <div className="catalog-badge">Las Mejores Marcas</div>

            <h2 className="catalog-title">Catálogo en Línea</h2>

            <p className="catalog-description">
              Consulta nuestro catálogo y encuentra tu rutina de cuidado capilar perfecta.
              Manejamos productos para todo tipo de cabello y necesidad. Venta exclusiva en Glanz Estética.
            </p>

            <button
              className="catalog-btn"
              onClick={() => navigate('/productos')}
            >
              Ir a Productos →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsPreview;

