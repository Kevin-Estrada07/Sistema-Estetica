import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Scissors,
  Package,
  BarChart2,
  UserCog,
  LogOut,
  Menu
} from "lucide-react"; // Íconos de lucide-react
import "../styles/Sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
    }
  };

  return (
    <>
      {/* Botón Hamburguesa para móviles */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-logo">✨ ESTÉTICA</h2>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                <Home size={18} /> Inicio
              </Link>
            </li>
            <li>
              <Link to="/citas" onClick={() => setIsOpen(false)}>
                <Calendar size={18} /> Citas
              </Link>
            </li>
            <li>
              <Link to="/clients" onClick={() => setIsOpen(false)}>
                <Users size={18} /> Clientes
              </Link>
            </li>
            <li>
              <Link to="/services" onClick={() => setIsOpen(false)}>
                <Scissors size={18} /> Servicios
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setIsOpen(false)}>
                <Package size={18} /> Inventario
              </Link>
            </li>
            <li>
              <Link to="/reports" onClick={() => setIsOpen(false)}>
                <BarChart2 size={18} /> Reportes
              </Link>
            </li>
            <li>
              <Link to="/users" onClick={() => setIsOpen(false)}>
                <UserCog size={18} /> Usuarios
              </Link>
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
