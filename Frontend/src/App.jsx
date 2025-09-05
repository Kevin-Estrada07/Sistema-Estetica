import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import './styles/styles.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Products from './pages/Product';
import Appointments from './pages/Appointments';

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Dashboard protegido */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
          <Route path="/clients" element={<PrivateRoute><Clients/></PrivateRoute>}/>
          <Route path="/services" element={<PrivateRoute><Services/></PrivateRoute>}/>
          <Route path="/products" element={<PrivateRoute><Products/></PrivateRoute>}/>
          <Route path="/citas" element={<PrivateRoute><Appointments/></PrivateRoute>}/>

          {/* Registro solo para admin */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
          {/* Redirección */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
