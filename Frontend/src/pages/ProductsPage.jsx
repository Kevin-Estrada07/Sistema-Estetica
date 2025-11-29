import React from 'react';
import Header from '../components/Header';
import ProductCatalog from '../components/ProductCatalog';
import Footer from '../components/Footer';

const ProductsPage = () => {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <ProductCatalog />
      </div>
      <Footer />
    </>
  );
};

export default ProductsPage;

