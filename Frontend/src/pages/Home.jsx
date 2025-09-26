import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Services from '../components/Services';
import AppointmentForm from '../components/AppointmentForm.jsx';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <Services />
      <AppointmentForm />
      <Testimonials />
      <Footer />
    </>
  );
}

export default Home;
