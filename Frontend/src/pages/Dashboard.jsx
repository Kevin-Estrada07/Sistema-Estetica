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

  // ⭐ Nuevos estados para drag & drop
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [toast, setToast] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ⭐ Auto-ocultar toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAll();

      // Extraer array de citas (ahora viene en res.data.data con paginación)
      const citasArray = Array.isArray(res.data.data) ? res.data.data : [];

      const citas = citasArray.map((a) => ({
        id: a.id,
        title: `${a.cliente?.nombre} - ${a.servicio?.nombre}`,
        start: `${a.fecha}T${a.hora}`,
        extendedProps: {
          cliente: a.cliente?.nombre,
          servicio: a.servicio?.nombre,
          empleado: a.empleado?.name,
          estado: a.estado,
          notas: a.notas,
          // ⭐ Guardar IDs necesarios para la actualización
          cliente_id: a.cliente_id,
          servicio_id: a.servicio_id,
          empleado_id: a.empleado_id,
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

  // ⭐ Manejar cuando se suelta el evento (drop)
  const handleEventDrop = (info) => {
    const event = info.event;
    const newDate = info.event.start;

    // ⭐ Validar que no sea una fecha/hora pasada
    const ahora = new Date();
    if (newDate < ahora) {
      setToast("❌ No puedes mover una cita a una fecha u hora que ya pasó");
      info.revert(); // Revertir inmediatamente
      return;
    }

    // Extraer nueva fecha y hora
    const fecha = newDate.toISOString().split("T")[0];
    const hora = newDate.toTimeString().split(" ")[0].substring(0, 5);

    // Guardar información para el modal de confirmación
    setDraggedEvent({
      id: event.id,
      title: event.title,
      oldDate: info.oldEvent.start,
      newDate: newDate,
      fecha: fecha,
      hora: hora,
      cliente_id: event.extendedProps.cliente_id,
      servicio_id: event.extendedProps.servicio_id,
      empleado_id: event.extendedProps.empleado_id,
      estado: event.extendedProps.estado,
      notas: event.extendedProps.notas,
      revertFunc: info.revert, // Función para revertir si hay error
    });
  };

  // ⭐ Confirmar cambio de fecha/hora
  const confirmEventUpdate = async () => {
    if (!draggedEvent) return;

    setIsUpdating(true);

    try {
      const data = {
        cliente_id: draggedEvent.cliente_id,
        servicio_id: draggedEvent.servicio_id,
        empleado_id: draggedEvent.empleado_id,
        fecha: draggedEvent.fecha,
        hora: draggedEvent.hora,
        estado: draggedEvent.estado,
        notas: draggedEvent.notas,
      };

      await appointmentsAPI.update(draggedEvent.id, data);
      setToast("✅ Cita actualizada exitosamente");
      fetchAppointments(); // Recargar eventos
      setDraggedEvent(null);
    } catch (err) {
      console.error("Error al actualizar cita:", err);

      // ⭐ Capturar error del backend (traslapes)
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error;

        if (err.response.status === 422) {
          setToast(`❌ ${errorMessage}`);
        } else {
          setToast(`❌ ${errorMessage || "Error al actualizar cita"}`);
        }
      } else {
        setToast("❌ Error de conexión");
      }

      // ⭐ Revertir el cambio visual en el calendario
      if (draggedEvent.revertFunc) {
        draggedEvent.revertFunc();
      }

      setDraggedEvent(null);
    } finally {
      setIsUpdating(false);
    }
  };

  // ⭐ Cancelar cambio de fecha/hora
  const cancelEventUpdate = () => {
    if (draggedEvent && draggedEvent.revertFunc) {
      draggedEvent.revertFunc();
    }
    setDraggedEvent(null);
  };

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
            <button className="btn-register" onClick={() => navigate("/payment")}>
              ➕ Nueva Venta
            </button>
            <button className="btn-register" onClick={() => navigate("/citas")}>
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
              initialView="dayGridMonth"
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
              // ⭐ Habilitar drag & drop
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              // ⭐ Opcional: cambiar cursor al arrastrar
              eventDragStart={(info) => {
                info.el.style.cursor = "grabbing";
              }}
              eventDragStop={(info) => {
                info.el.style.cursor = "grab";
              }}
            />
          </div>
        </section>

        {/* Modal de detalles de cita */}
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

        {/* ⭐ Modal de confirmación de cambio de fecha/hora */}
        {draggedEvent && (
          <Modal
            isOpen={!!draggedEvent}
            onClose={cancelEventUpdate}
            title="Confirmar cambio de horario"
            hideCloseButton>
            <div className="event-details">
              <p style={{ marginBottom: "16px", fontWeight: "500" }}>
                ¿Deseas mover la siguiente cita?
              </p>
              <p>
                <strong>Cita:</strong> {draggedEvent.title}
              </p>
              <p>
                <strong>Fecha/hora anterior:</strong>{" "}
                {new Date(draggedEvent.oldDate).toLocaleString("es-MX")}
              </p>
              <p style={{ color: "#7C3AED", fontWeight: "600" }}>
                <strong>Nueva fecha/hora:</strong>{" "}
                {new Date(draggedEvent.newDate).toLocaleString("es-MX")}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  className="btn-confirm"
                  onClick={confirmEventUpdate}
                  disabled={isUpdating}>
                  {isUpdating ? "Actualizando..." : "Confirmar"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={cancelEventUpdate}
                  disabled={isUpdating}>
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ⭐ Toast para notificaciones */}
        {toast && (
          <div
            className={`toast ${
              toast.startsWith("❌") ? "toast-error" : "toast-success"
            }`}>
            {toast}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;