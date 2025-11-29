import React from 'react';
import Header from '../components/Header';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const AboutUsPage = () => {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <AboutUs />
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage;

