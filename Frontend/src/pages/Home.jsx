import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutUsPreview from '../components/AboutUsPreview';
import ServicesPreview from '../components/ServicesPreview';
import ProductsPreview from '../components/ProductsPreview';
import AppointmentForm from '../components/AppointmentForm.jsx';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Header />
      <div id="home">
        <HeroSection />
      </div>
      <AboutUsPreview />
      <ServicesPreview />
      <ProductsPreview />
      <div id="appointment">
        <AppointmentForm />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="contact">
        <Footer />
      </div>
    </>
  );
}

export default Home;
