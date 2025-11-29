import React, { useState } from 'react';
import { Package, Filter, X } from 'lucide-react';
import '../styles/ProductCatalog.css';

const ProductCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos los Productos', count: 90 },
    { id: 'kerastase', name: 'Kérastase', count: 31 },
    { id: 'tecitaly', name: 'Tec Italy', count: 48 },
    { id: 'arium', name: 'Arium', count: 11 }
  ];

  const products = {
    kerastase: [
      { id: 1, name: 'Blond Absolu', category: 'Kérastase', subcategory: 'Blond Absolu', image: '/images/products/kerastase-blond.jpg', price: '$850.00 MXN', description: 'Línea especializada para cabellos rubios, decolorados o con mechas. Neutraliza tonos amarillos y aporta brillo.' },
      { id: 2, name: 'Densifique', category: 'Kérastase', subcategory: 'Densifique', image: '/images/products/kerastase-densifique.jpg', price: '$920.00 MXN', description: 'Tratamiento densificador que restaura la densidad capilar y fortalece el cabello desde la raíz.' },
      { id: 3, name: 'Genesis Homme', category: 'Kérastase', subcategory: 'Genesis Homme', image: '/images/products/kerastase-genesis.jpg', price: '$780.00 MXN', description: 'Línea anticaída específica para hombres. Fortalece y previene la caída del cabello.' },
      { id: 4, name: 'Nutritive', category: 'Kérastase', subcategory: 'Nutritive', image: '/images/products/kerastase-nutritive.jpg', price: '$820.00 MXN', description: 'Nutrición intensa para cabellos secos. Aporta suavidad, brillo y facilita el peinado.' },
      { id: 5, name: 'Resistance', category: 'Kérastase', subcategory: 'Resistance', image: '/images/products/kerastase-resistance.jpg', price: '$890.00 MXN', description: 'Reconstrucción profunda para cabellos dañados y debilitados. Restaura la fibra capilar.' },
      { id: 6, name: 'Specifique', category: 'Kérastase', subcategory: 'Specifique', image: '/images/products/kerastase-specifique.jpg', price: '$750.00 MXN', description: 'Tratamiento para cuero cabelludo sensible. Equilibra y purifica el cuero cabelludo.' },
    ],
    tecitaly: [
      { id: 7, name: 'Blonde Plex', category: 'Tec Italy', subcategory: 'Blonde Plex', image: '/images/products/tecitaly-blonde.jpg', price: '$650.00 MXN', description: 'Sistema de protección para cabellos rubios durante procesos químicos. Mantiene la integridad del cabello.' },
      { id: 8, name: 'Color Care', category: 'Tec Italy', subcategory: 'Color Care', image: '/images/products/tecitaly-color.jpg', price: '$580.00 MXN', description: 'Protección y prolongación del color. Mantiene la intensidad y brillo del tinte.' },
      { id: 9, name: 'Men Dimension', category: 'Tec Italy', subcategory: 'Men Dimension', image: '/images/products/tecitaly-men.jpg', price: '$520.00 MXN', description: 'Línea completa para el cuidado masculino. Fortalece y revitaliza el cabello del hombre.' },
      { id: 10, name: 'Moisture', category: 'Tec Italy', subcategory: 'Moisture', image: '/images/products/tecitaly-moisture.jpg', price: '$600.00 MXN', description: 'Hidratación profunda para cabellos secos y deshidratados. Restaura la humedad natural.' },
      { id: 11, name: 'Nourishing', category: 'Tec Italy', subcategory: 'Nourishing', image: '/images/products/tecitaly-nourishing.jpg', price: '$620.00 MXN', description: 'Nutrición intensiva con aceites naturales. Suaviza y aporta brillo excepcional.' },
      { id: 12, name: 'Omni Restore', category: 'Tec Italy', subcategory: 'Omni Restore', image: '/images/products/tecitaly-omni.jpg', price: '$680.00 MXN', description: 'Restauración completa para cabellos extremadamente dañados. Reconstruye la fibra capilar.' },
      { id: 13, name: 'Repair', category: 'Tec Italy', subcategory: 'Repair', image: '/images/products/tecitaly-repair.jpg', price: '$590.00 MXN', description: 'Reparación intensiva para cabellos maltratados. Sella las cutículas y fortalece.' },
      { id: 14, name: 'Scalp Solution', category: 'Tec Italy', subcategory: 'Scalp Solution', image: '/images/products/tecitaly-scalp.jpg', price: '$550.00 MXN', description: 'Tratamiento especializado para problemas del cuero cabelludo. Equilibra y purifica.' },
      { id: 15, name: 'Styling', category: 'Tec Italy', subcategory: 'Styling', image: '/images/products/tecitaly-styling.jpg', price: '$480.00 MXN', description: 'Productos de estilizado profesional. Fijación duradera con acabado natural.' },
    ],
    arium: [
      { id: 16, name: 'Arium Shampoo', category: 'Arium', subcategory: 'Cuidado Capilar', image: '/images/products/arium-shampoo.jpg', price: '$420.00 MXN', description: 'Shampoo profesional de uso diario. Limpieza suave y efectiva para todo tipo de cabello.' },
      { id: 17, name: 'Arium Conditioner', category: 'Arium', subcategory: 'Cuidado Capilar', image: '/images/products/arium-conditioner.jpg', price: '$450.00 MXN', description: 'Acondicionador que desenreda y suaviza. Facilita el peinado y aporta brillo.' },
      { id: 18, name: 'Arium Treatment', category: 'Arium', subcategory: 'Tratamiento', image: '/images/products/arium-treatment.jpg', price: '$520.00 MXN', description: 'Tratamiento intensivo semanal. Restaura y fortalece el cabello en profundidad.' },
    ]
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') {
      return [...products.kerastase, ...products.tecitaly, ...products.arium];
    }
    return products[selectedCategory] || [];
  };

  const filteredProducts = getFilteredProducts();

  return (
    <section id="products" className="products-section">
      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <span className="products-badge">Catálogo de Productos</span>
          <h2 className="products-title">Productos Profesionales</h2>
          <p className="products-subtitle">
            Trabajamos con las mejores marcas internacionales para garantizar resultados excepcionales
          </p>
          <p className="products-note">
            <Package size={18} />
            Venta exclusiva en Glanz Estética
          </p>
        </div>

        {/* Filtros */}
        <div className="products-filters">
          <div className="filter-label">
            <Filter size={18} />
            <span>Filtrar por marca:</span>
          </div>
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
                <span className="filter-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80';
                  }}
                />
                <div className="product-badge">{product.category}</div>
              </div>
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-subcategory">{product.subcategory}</p>
                <button className="product-btn" onClick={() => openModal(product)}>
                  Más Información
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <Package size={48} />
            <p>No se encontraron productos en esta categoría</p>
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal-product" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-product" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-content-product">
              <div className="modal-image-section">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80';
                  }}
                />
                <span className="modal-badge">{selectedProduct.category}</span>
              </div>

              <div className="modal-info-section-product">
                <h2 className="modal-title-product">{selectedProduct.name}</h2>
                <p className="modal-subcategory-product">{selectedProduct.subcategory}</p>
                <p className="modal-price-product">{selectedProduct.price}</p>
                <div className="modal-divider-product"></div>
                <p className="modal-description-product">{selectedProduct.description}</p>

                <div className="modal-actions-product">
                  <button
                    className="modal-btn-primary"
                    onClick={() => {
                      const phoneNumber = "523329438598";
                      const message = `Hola, me interesa el producto: ${selectedProduct.name} - ${selectedProduct.category}`;
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    Consultar Disponibilidad
                  </button>
                  <p className="modal-note">
                    <Package size={16} />
                    Disponible exclusivamente en Glanz Estética
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCatalog;

