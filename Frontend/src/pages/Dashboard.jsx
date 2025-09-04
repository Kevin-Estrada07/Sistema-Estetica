import React from "react";
import "../styles/Dashboard.css";
import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';


const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="content">
        <header className="header">
          <h1>Bienvenido(a)💖</h1>
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
