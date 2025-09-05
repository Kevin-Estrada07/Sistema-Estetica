import React from "react";
import "../styles/Dashboard.css";
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext"; // importamos el contexto

const Dashboard = () => {
  const { user } = useAuth(); // obtenemos el usuario logueado

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="content">
        <header className="header">
          <h1>Bienvenido(a) 💖 {user?.name}</h1>
          {user?.role && (
            <p className="user-role">Rol: <strong>{user.role.name}</strong></p>
          )}
        </header>

        <section className="cards">
          <div className="card">
            <h3>Citas de hoy</h3>
            <p>8</p>
          </div>
          <div className="card">
            <h3>Clientes nuevos</h3>
            <p>3</p>
          </div>
          <div className="card">
            <h3>Servicios activos</h3>
            <p>12</p>
          </div>
        </section>

        <section className="panel">
          <h2>Agenda</h2>
          <p>Aquí irá el calendario o próximas citas.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
