import React, { useEffect, useState, useRef } from "react";
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
import { inventaryAPI } from "../api/InventaryAPI";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({
    citasHoy: 0,
    clientes: 0,
    servicios: 0,
  });

  // Estados para drag & drop
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [toast, setToast] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [calendarReady, setCalendarReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Estado para productos bajo stock
  const [productosBajoStock, setProductosBajoStock] = useState([]);

  // Detectar cambios en tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowCalendar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-ocultar toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Forzar re-render del calendario cuando se muestra en móvil
  useEffect(() => {
    if (showCalendar && isMobile) {
      setCalendarReady(false);
      
      // Esperar a que el DOM esté listo
      setTimeout(() => {
        setCalendarReady(true);
        setCalendarKey(prev => prev + 1);
        
        // Forzar actualizaciones múltiples
        [100, 300, 500, 800, 1000].forEach(delay => {
          setTimeout(() => {
            if (calendarRef.current) {
              try {
                const calendarApi = calendarRef.current.getApi();
                calendarApi.updateSize();
                calendarApi.render();
              } catch (e) {
                console.log('Error actualizando calendario:', e);
              }
            }
          }, delay);
        });
      }, 50);
    } else if (!isMobile && !showCalendar) {
      setShowCalendar(true);
      setCalendarReady(true);
    }
  }, [showCalendar, isMobile]);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      const citasArray = Array.isArray(res.data.data) ? res.data.data : [];

      const citas = citasArray.map((a) => ({
        id: a.id,
        title: `${a.cliente?.nombre} - ${a.servicio?.nombre}`,
        start: `${a.fecha}T${a.hora}`,
        extendedProps: {
          cliente: a.cliente?.nombre,
          cliente_telefono: a.cliente?.telefono,
          servicio: a.servicio?.nombre,
          empleado: a.empleado?.name,
          estado: a.estado,
          notas: a.notas,
          fecha: a.fecha,
          hora: a.hora,
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

    const fetchProductosBajoStock = async () => {
      try {
        const res = await inventaryAPI.bajoStock(10);
        setProductosBajoStock(res.data.productos);
      } catch (err) {
        console.error("❌ Error cargando productos bajo stock:", err);
      }
    };
    fetchProductosBajoStock();
  }, []);

  const handleEventDrop = (info) => {
    const event = info.event;
    const newDate = info.event.start;

    const ahora = new Date();
    if (newDate < ahora) {
      setToast("❌ No puedes mover una cita a una fecha u hora que ya pasó");
      info.revert();
      return;
    }

    const fecha = newDate.toISOString().split("T")[0];
    const hora = newDate.toTimeString().split(" ")[0].substring(0, 5);

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
      revertFunc: info.revert,
    });
  };

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
      fetchAppointments();
      setDraggedEvent(null);
    } catch (err) {
      console.error("Error al actualizar cita:", err);

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

      if (draggedEvent.revertFunc) {
        draggedEvent.revertFunc();
      }

      setDraggedEvent(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEventUpdate = () => {
    if (draggedEvent && draggedEvent.revertFunc) {
      draggedEvent.revertFunc();
    }
    setDraggedEvent(null);
  };

  const enviarRecordatorioWhatsApp = (event) => {
    if (!event.extendedProps.cliente_telefono) {
      setToast("❌ El cliente no tiene teléfono registrado");
      return;
    }

    const fechaCita = new Date(event.start);
    const opciones = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const fechaFormateada = fechaCita.toLocaleDateString('es-MX', opciones);

    const mensaje = `¡Hola ${event.extendedProps.cliente}! 👋\n\n` +
      `Te recordamos tu cita en nuestra estética:\n\n` +
      `📅 *Fecha y hora:* ${fechaFormateada}\n` +
      `💆 *Servicio:* ${event.extendedProps.servicio}\n` +
      `👤 *Atendido por:* ${event.extendedProps.empleado}\n\n` +
      `¡Te esperamos! Si necesitas reagendar, contáctanos. 💕`;

    const telefonoLimpio = event.extendedProps.cliente_telefono.replace(/\D/g, '');
    const urlWhatsApp = `https://wa.me/52${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, '_blank');
    setToast("✅ Abriendo WhatsApp...");
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
          <div className="card card-clickable" onClick={() => navigate("/citas")}>
            <h3>📅 Citas de Hoy</h3>
            <p>{stats.citasHoy}</p>
            <small className="card-hint">Click para ver citas</small>
          </div>
          <div className="card card-clickable" onClick={() => navigate("/clientes")}>
            <h3>👥 Clientes</h3>
            <p>{stats.clientes}</p>
            <small className="card-hint">Click para ver clientes</small>
          </div>
          <div className="card card-clickable" onClick={() => navigate("/services")}>
            <h3>💅 Servicios Activos</h3>
            <p>{stats.servicios}</p>
            <small className="card-hint">Click para ver servicios</small>
          </div>
          <div className={`card card-clickable ${productosBajoStock.length > 0 ? 'card-warning' : ''}`} onClick={() => navigate("/inventary")}>
            <h3>⚠️ Productos Bajo Stock</h3>
            <p>{productosBajoStock.length}</p>
            <small className="card-hint">{productosBajoStock.length > 0 ? 'Click para ver detalles' : 'Click para ver inventario'}</small>
          </div>
        </section>

        {productosBajoStock.length > 0 && (
          <section className="alert-section">
            <div className="alert-box">
              <div className="alert-header">
                <h3>⚠️ Alerta de Inventario</h3>
                <button className="btn-view-all" onClick={() => navigate("/inventary")}>
                  Ver Inventario
                </button>
              </div>
              <div className="alert-content">
                <p>Los siguientes productos están por debajo del umbral de stock:</p>
                <ul className="alert-list">
                  {productosBajoStock.slice(0, 5).map(p => (
                    <li key={p.id}>
                      <span className="product-name">{p.nombre}</span>
                      <span className={`stock-badge ${p.stock === 0 ? 'stock-zero' : 'stock-low'}`}>
                        Stock: {p.stock}
                      </span>
                    </li>
                  ))}
                </ul>
                {productosBajoStock.length > 5 && (
                  <p className="more-products">
                    ... y {productosBajoStock.length - 5} producto(s) más
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="panel">
          <div className="panel-header">
            <h2>📅 Agenda de Citas</h2>
          </div>

          {/* VISTA MÓVIL - LISTA DE CITAS */}
          {isMobile ? (
            <div className="mobile-appointments">
              <div className="date-selector-container">
                <div className="date-selector">
                  <input 
                    type="date" 
                    className="date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Seleccionar fecha"
                  />
                </div>
                {selectedDate && (
                  <button 
                    className="btn-show-all"
                    onClick={() => setSelectedDate('')}
                  >
                    📋 Mostrar Todas
                  </button>
                )}
              </div>

              {(() => {
                // Filtrar citas por fecha seleccionada (si hay una)
                const filteredEvents = selectedDate 
                  ? events.filter(event => {
                      const eventDate = new Date(event.start).toISOString().split('T')[0];
                      return eventDate === selectedDate;
                    })
                  : events;

                // Ordenar por fecha
                const sortedEvents = filteredEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

                if (sortedEvents.length === 0) {
                  return (
                    <div className="no-appointments">
                      <p>📅 {selectedDate ? 'No hay citas programadas para este día' : 'No hay citas programadas'}</p>
                    </div>
                  );
                }

                // Agrupar por fecha cuando se muestran todas
                const groupedByDate = {};
                sortedEvents.forEach(event => {
                  const eventDate = new Date(event.start).toISOString().split('T')[0];
                  if (!groupedByDate[eventDate]) {
                    groupedByDate[eventDate] = [];
                  }
                  groupedByDate[eventDate].push(event);
                });

                return (
                  <div className="appointments-list">
                    {Object.keys(groupedByDate).map(date => {
                      const dateObj = new Date(date + 'T00:00:00');
                      const isToday = date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div key={date}>
                          {/* Mostrar separador de fecha solo cuando se muestran todas */}
                          {!selectedDate && (
                            <div className={`date-divider ${isToday ? 'today-divider' : ''}`}>
                              <span className="date-divider-text">
                                {isToday ? '📍 Hoy' : ''} {dateObj.toLocaleDateString('es-MX', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </span>
                            </div>
                          )}

                          {groupedByDate[date].map(event => {
                            const eventDate = new Date(event.start);
                            const estado = event.extendedProps.estado;
                            const isCompleted = estado === 'completada' || estado === 'cancelada';
                            
                            return (
                              <div 
                                key={event.id} 
                                className={`appointment-card ${isCompleted ? 'completed' : 'active'}`}
                                onClick={() => {
                                  const fakeEvent = {
                                    id: event.id,
                                    title: event.title,
                                    start: event.start,
                                    extendedProps: event.extendedProps
                                  };
                                  setSelectedEvent(fakeEvent);
                                }}
                              >
                                <div className="appointment-time">
                                  <span className="time-icon">🕐</span>
                                  <span className="time-text">
                                    {eventDate.toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <div className="appointment-info">
                                  <h4>{event.extendedProps.cliente}</h4>
                                  <p className="service-name-card">💅 {event.extendedProps.servicio}</p>
                                  <p className="employee-name">👤 {event.extendedProps.empleado}</p>
                                  <span className={`status-badge status-${estado.replace(' ', '-')}`}>
                                    {estado}
                                  </span>
                                </div>
                                <div className="appointment-date">
                                  <span className="date-day">
                                    {eventDate.getDate()}
                                  </span>
                                  <span className="date-month">
                                    {eventDate.toLocaleDateString('es-MX', { month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* VISTA ESCRITORIO - CALENDARIO */
            <div className="calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                key={calendarKey}
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
                eventColor="#f15456"
                eventDisplay="block"
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="21:00:00"
                scrollTime="08:00:00"
                allDaySlot={false}
                expandRows={true}
                editable={true}
                droppable={true}
                eventDrop={handleEventDrop}
                eventClick={(info) => setSelectedEvent(info.event)}
              />
            </div>
          )}
        </section>

        {/* Modal de detalles de cita */}
        {selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            title={`Cita #${selectedEvent.id}`}
            actions={
              <>
                {/* Botón Atender - Solo para citas pendientes */}
                {selectedEvent.extendedProps.estado === "pendiente" && (
                  <button
                    className="btn-attend"
                    onClick={async () => {
                      try {
                        await appointmentsAPI.updateEstado(selectedEvent.id, { estado: "en proceso" });
                        setSelectedEvent(null);
                        fetchAppointments();
                        setToast("✅ Cita En proceso");
                      } catch (err) {
                        console.error("Error al atender cita:", err);
                        setToast("❌ Error al atender la cita");
                      }
                    }}>
                    ✅ Atender
                  </button>
                )}

                {selectedEvent.extendedProps.estado === "en proceso" && (
                  <button
                    className="btn-complete"
                    onClick={async () => {
                      try {
                        await appointmentsAPI.updateEstado(selectedEvent.id, { estado: "completada" });
                        setSelectedEvent(null);
                        fetchAppointments();
                        setToast("✅ Cita Completada");
                      } catch (err) {
                        console.error("Error al completar cita:", err);
                        setToast("❌ Error al completar la cita");
                      }
                    }}>
                    ✔️ Completar
                  </button>
                )}

                {(() => {
                  const citaFecha = new Date(selectedEvent.start);
                  const ahora = new Date();
                  const esFutura = citaFecha > ahora;
                  const esPendienteOEnProceso = selectedEvent.extendedProps.estado === 'pendiente' ||
                    selectedEvent.extendedProps.estado === 'en proceso';

                  return esFutura && esPendienteOEnProceso && selectedEvent.extendedProps.cliente_telefono ? (
                    <button
                      className="btn-whatsapp"
                      onClick={() => enviarRecordatorioWhatsApp(selectedEvent)}>
                      📱 Enviar WhatsApp
                    </button>
                  ) : null;
                })()}

                <button className="btn-cancel" onClick={() => setSelectedEvent(null)}>
                  ❌ Cerrar
                </button>
              </>
            }>
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
                <strong>Estado:</strong> <span className={`estado-badge estado-${selectedEvent.extendedProps.estado.replace(' ', '-')}`}>{selectedEvent.extendedProps.estado}</span>
              </p>
              {selectedEvent.extendedProps.notas && (
                <p>
                  <strong>Notas:</strong> {selectedEvent.extendedProps.notas}
                </p>
              )}
            </div>
          </Modal>
        )}

        {/* Modal de confirmación de cambio de fecha/hora */}
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
              <p style={{ color: "#f15456", fontWeight: "600" }}>
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

        {/* Toast para notificaciones */}
        {toast && (
          <div
            className={`toast ${toast.startsWith("❌") ? "toast-error" : "toast-success"
              }`}>
            {toast}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;