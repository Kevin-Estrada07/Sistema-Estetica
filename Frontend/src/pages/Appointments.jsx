import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaUserCheck } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import { appointmentsAPI } from "../api/appointmentsAPI";
import { clientsAPI } from "../api/clientesAPI";
import { servicesAPI } from "../api/serviciosAPI";
import { empleadosAPI } from "../api/empleadosAPI";
import "../styles/Appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [clienteId, setClienteId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [estado, setEstado] = useState("pendiente");
  const [notas, setNotas] = useState("");

  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const citasRes = await appointmentsAPI.getInfo();
      const [clientesRes, serviciosRes, empleadosRes] = await Promise.all([
        clientsAPI.getAll(),
        servicesAPI.getAll(),
        empleadosAPI.getAll()
      ]);

      console.log("Appointments:", citasRes.data);
      console.log("Clients:", clientesRes.data);
      console.log("Services:", serviciosRes.data);
      console.log("Empleados:", empleadosRes.data);

      setAppointments(Array.isArray(citasRes.data.data) ? citasRes.data.data : []);
      setClients(Array.isArray(clientesRes.data) ? clientesRes.data : []);
      setServices(Array.isArray(serviciosRes.data) ? serviciosRes.data : []);
      setUsers(Array.isArray(empleadosRes.data) ? empleadosRes.data : []);

    } catch (err) {
      console.error("Error en fetchData:", err.response?.data || err.message);
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear hora a HH:mm
  const formatHora = (hora) => {
    if (!hora) return "";

    if (/^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(hora)) {
      return hora.substring(0, 5);
    }

    return hora;
  };

  // Validar que la fecha/hora no sea en el pasado
  const validarFechaHora = (fecha, hora) => {
    if (!fecha || !hora) return true;

    const fechaHoraCita = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    return fechaHoraCita > ahora;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar fecha/hora no sea pasada
    if (!validarFechaHora(fecha, hora)) {
      setToast("❌ No puedes registrar una cita en una fecha u hora que ya pasó");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = {
        cliente_id: clienteId,
        servicio_id: servicioId,
        empleado_id: empleadoId,
        fecha,
        hora,
        estado,
        notas,
      };

      if (editAppointment) {
        await appointmentsAPI.update(editAppointment.id, data);
        setToast("✅ Cita actualizada exitosamente");
      } else {
        await appointmentsAPI.create(data);
        setToast("✅ Cita registrada exitosamente");
      }

      fetchData();
      closeModal();

    } catch (err) {
      console.error("Error completo:", err);

      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error;

        if (err.response.status === 422) {
          setToast(`❌ ${errorMessage}`);
        } else if (err.response.status === 404) {
          setToast("❌ Recurso no encontrado");
        } else if (err.response.status === 500) {
          setToast("❌ Error del servidor. Intenta más tarde");
        } else {
          setToast(`❌ ${errorMessage || "Error al guardar cita"}`);
        }
      } else if (err.request) {
        setToast("❌ Sin respuesta del servidor. Verifica tu conexión");
      } else {
        setToast("❌ Error al procesar la solicitud");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await appointmentsAPI.delete(id);
      setToast("✅ Cita eliminada");
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al eliminar cita";
      setToast(`❌ ${errorMessage}`);
    }
  };

  const openEditModal = (appointment) => {
    setEditAppointment(appointment);
    setClienteId(appointment.cliente_id);
    setServicioId(appointment.servicio_id);
    setEmpleadoId(appointment.empleado_id);
    setFecha(appointment.fecha);
    setHora(formatHora(appointment.hora));
    setEstado(appointment.estado);
    setNotas(appointment.notas || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAppointment(null);
    setClienteId("");
    setServicioId("");
    setEmpleadoId("");
    setFecha("");
    setHora("");
    setEstado("pendiente");
    setNotas("");
  };

  const handleEstadoChange = async (id, newEstado) => {
    try {
      await appointmentsAPI.updateEstado(id, { estado: newEstado });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, estado: newEstado } : a))
      );
      setToast("✅ Estado actualizado");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al actualizar estado";
      setToast(`❌ ${errorMessage}`);
    }
  };

  const handleCancelar = (appointment) => {
    if (window.confirm(`¿Cancelar la cita de ${appointment.cliente}?`)) {
      handleEstadoChange(appointment.id, "cancelada");
      setToast("🚫 Cita cancelada");
    }
  };

  return (
    <div className="">
      <Sidebar />
      <main className="appointments-content">
        <header className="appointments-header">
          <h1>📅 Citas</h1>
          <div className="appointments-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar cita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-register" onClick={() => setIsModalOpen(true)}>
              ➕ Nueva Cita
            </button>
          </div>
        </header>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="table-wrapper">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter((a) => {
                    if (!search) return true;
                    const term = search.toLowerCase();
                    return (
                      a.cliente.toLowerCase().includes(term) ||
                      a.servicio.toLowerCase().includes(term) ||
                      a.empleado.toLowerCase().includes(term) ||
                      a.fecha.toLowerCase().includes(term) 
                    );
                  })

                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.cliente}</td>
                      <td>{a.servicio}</td>
                      <td>{a.empleado}</td>
                      <td>{a.fecha}</td>
                      <td>{a.hora}</td>
                      <td>{a.estado}</td>
                      <td>{a.notas}</td>
                      <td>
                        {a.estado === "pendiente" && (
                          <button
                            className="btn-attender"
                            onClick={() => handleEstadoChange(a.id, "en proceso")}>
                            <FaUserCheck /> Atender
                          </button>
                        )}

                        {a.estado === "en proceso" && (
                          <Link to={`/payment/${a.id}`} className="btn-pagar">
                            <FaUserCheck /> Pagar
                          </Link>
                        )}

                        <button className="btn-edit" onClick={() => openEditModal(a)}>
                          <FaEdit /> Editar
                        </button>

                        <button className="btn-cancelar" onClick={() => handleCancelar(a)}>
                          <GiCancel /> Cancelar
                        </button>

                        <button className="btn-delete" onClick={() => setConfirmDelete(a)}>
                          <FaTrashAlt /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal form */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editAppointment ? "Editar Cita" : "Nueva Cita"}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Servicio</label>
                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Empleado</label>
                <select
                  value={empleadoId}
                  onChange={(e) => setEmpleadoId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona empleado</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn-register"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting
                ? "Procesando..."
                : (editAppointment ? "Actualizar" : "Registrar")
              }
            </button>
          </form>
        </Modal>

        {confirmDelete && (
          <Modal
            isOpen={!!confirmDelete}
            onClose={() => setConfirmDelete(null)}
            hideCloseButton
            actions={
              <>
                <button
                  className="btn-confirm"
                  onClick={() => {
                    handleDelete(confirmDelete.id);
                    setConfirmDelete(null);
                  }}>
                  Sí
                </button>
                <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>
                  No
                </button>
              </>
            }>
            <div className="delete-client-text">
              {confirmDelete ? `¿Eliminar cita de ${confirmDelete.cliente}?` : ""}
            </div>
          </Modal>
        )}

        {/* ⭐ TOAST MEJORADO */}
        {toast && (
          <div className={`toast ${toast.startsWith('❌') ? 'toast-error' : 'toast-success'}`}>
            {toast}
          </div>
        )}
      </main>
    </div>
  );
};

export default Appointments;