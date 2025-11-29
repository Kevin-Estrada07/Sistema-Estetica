import React from 'react';
import Header from '../components/Header';
import Services from '../components/Services';
import Footer from '../components/Footer';

const ServicesPage = () => {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <Services />
      </div>
      <Footer />
    </>
  );
};

export default ServicesPage;

