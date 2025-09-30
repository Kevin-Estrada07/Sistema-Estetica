import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { appointmentsAPI } from "../api/appointmentsAPI";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/adminAPI";


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({
    citasHoy: 0,
    clientes: 0,
    servicios: 0,
  });

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      const citas = res.data.map((a) => ({
        id: a.id,
        title: `${a.cliente?.nombre} - ${a.servicio?.nombre}`,
        start: `${a.fecha}T${a.hora}`,
        extendedProps: {
          cliente: a.cliente?.nombre,
          servicio: a.servicio?.nombre,
          empleado: a.empleado?.name,
          estado: a.estado,
          notas: a.notas,
        },
      }));
      setEvents(citas);
    } catch (err) {
      console.error("❌ Error cargando citas:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getDashboardStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error("❌ Error cargando estadísticas:", err);
      }
    }; 
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <header className="headerDashboard">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Bienvenido(a), <span className="user-name">{user?.name}</span> 💖
            </h1>
            {user?.role && (
              <p className="user-role">
                Rol: <span className="role-badge">{user.role.name}</span>
              </p>
            )}
          </div>

          <div className="header-buttons">
            <button
              className="btn-register"
              onClick={() => navigate("/payment")}>
              ➕ Nueva Venta
            </button>
            <button
              className="btn-register"
              onClick={() => navigate("/citas")}>
              ➕ Registrar Cita
            </button>
          </div>
        </header>



        <section className="cards">
          <div className="card">
            <h3>Citas de Hoy</h3>
            <p>{stats.citasHoy}</p>
          </div>
          <div className="card">
            <h3>Clientes</h3>
            <p>{stats.clientes}</p>
          </div>
          <div className="card">
            <h3>Servicios Activos</h3>
            <p>{stats.servicios}</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>📅 Agenda de Citas</h2>

          </div>
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth" // 👈 vista inicial semana
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              locales={[esLocale]}
              locale="es"
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
              }}
              events={events}
              eventColor="#7C3AED"
              eventDisplay="block"
              height="80vh"
              slotMinTime="08:00:00"
              slotMaxTime="24:00:00"
              eventClick={(info) => setSelectedEvent(info.event)}
            />
          </div>
        </section>

        {/* Modal solo detalles */}
        {selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            title={`Cita #${selectedEvent.id}`}>
            <div className="event-details">
              <p>
                <strong>Cliente:</strong> {selectedEvent.extendedProps.cliente}
              </p>
              <p>
                <strong>Servicio:</strong> {selectedEvent.extendedProps.servicio}
              </p>
              <p>
                <strong>Empleado:</strong> {selectedEvent.extendedProps.empleado}
              </p>
              <p>
                <strong>Fecha y hora:</strong>{" "}
                {new Date(selectedEvent.start).toLocaleString("es-MX")}
              </p>
              <p>
                <strong>Estado:</strong> {selectedEvent.extendedProps.estado}
              </p>
              {selectedEvent.extendedProps.notas && (
                <p>
                  <strong>Notas:</strong> {selectedEvent.extendedProps.notas}
                </p>
              )}
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
