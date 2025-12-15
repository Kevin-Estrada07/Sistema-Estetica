import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import './styles/styles.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Contact from './pages/Contact';
import AboutUsPage from './pages/AboutUsPage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
// import PaymentPage from './pages/PaymentPage';
import SalePage from './pages/SalePage';
import ReportPage from './pages/ReportPage';
import Inventary from './pages/Inventary';
import SalesHistory from './pages/SalesHistory';
import Reembolsos from './pages/Reembolsos';
import TestimoniosAdmin from './pages/TestimoniosAdmin';
import Conexion from './components/conexion';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>; // mientras valida token
  return user ? children : <Navigate to="/" />;
};

// Componente para rutas protegidas solo admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!user) {
    // si no hay sesión -> login
    return <Navigate to="/" />;
  }

  if (user.role?.name !== "admin") {
    // si hay sesión pero no es admin -> acceso denegado
    return <Navigate to="/unauthorized" />;
  }

  return children;
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/nuestra-historia" element={<AboutUsPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/conexion" element={<Conexion />} />

          {/* Dashboard protegido */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
          <Route path="/citas" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/payment/:appointmentId?" element={<PrivateRoute><SalePage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
          <Route path="/Inventary" element={<PrivateRoute><Inventary /></PrivateRoute>} />
          <Route path="/SalesHistory" element={<PrivateRoute><SalesHistory /></PrivateRoute>} />

          {/* Registro solo para admin */}
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/reembolsos" element={<AdminRoute><Reembolsos /></AdminRoute>} />
          <Route path="/testimonios-admin" element={<AdminRoute><TestimoniosAdmin /></AdminRoute>} />
          {/* Redirección */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
