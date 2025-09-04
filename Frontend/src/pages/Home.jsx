import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Services from '../components/Services';
import AppointmentForm from '../components/AppointmentForm';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import Conexion from '../components/Conexion';

function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <Services />
      <AppointmentForm />
      <Testimonials />
      <Footer />
      <Conexion />
    </>
  );
}

export default Home;
