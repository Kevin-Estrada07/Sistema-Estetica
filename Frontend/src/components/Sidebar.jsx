import React from "react";
import { useAuth } from "../context/AuthContext"; // tu contexto de autenticación
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();  // sacamos la función logout
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
    }
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">✨ ESTETICA</h2>
      <nav>
        <ul>
          <li><Link to="/dashboard">Inicio</Link></li>
          <li><Link to="/citas">Citas</Link></li>
          <li><Link to="/clients">Clientes</Link></li>
          <li><Link to="/services">Servicios</Link></li>
          <li><Link to="/products">Inventario</Link></li>
          <li><Link to="/reports">Reportes</Link></li>
          <li><Link to="/users">Usuarios</Link></li>
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
