import React, { useState, useEffect, useMemo } from "react";
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

// Estado inicial del formulario
const INITIAL_FORM_STATE = {
  cliente_id: "",
  servicio_id: "",
  empleado_id: "",
  fecha: "",
  hora: "",
  estado: "pendiente",
  notas: "",
};

const Appointments = () => {
  // Estados de datos
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Estados de feedback
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const normalizeData = (data) => {
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  };

  const transformAppointments = (citas) => {
    return citas.map((cita) => ({
      ...cita,
      cliente: cita.cliente?.nombre || cita.cliente || "N/A",
      servicio: cita.servicio?.nombre || cita.servicio || "N/A",
      empleado: cita.empleado?.name || cita.empleado || "N/A",
    }));
  };

  // Obtener citas con paginación
  const fetchData = async (page = 1) => {
    try {
      const [citasRes, clientesRes, serviciosRes, empleadosRes] = await Promise.all([
        appointmentsAPI.getAll(page),
        clientsAPI.getAll(),
        servicesAPI.getAll(),
        empleadosAPI.getAll()
      ]);

      // Extraer datos y paginación de citas
      const citasData = citasRes.data;
      const citasArray = Array.isArray(citasData.data) ? citasData.data : [];

      // Transformar citas para mostrar nombres en lugar de objetos
      const citasTransformadas = transformAppointments(citasArray);
      setAppointments(citasTransformadas);

      // Guardar información de paginación
      if (citasData.pagination) {
        setPagination(citasData.pagination);
      }

      // Normalizar otros datos
      setClients(normalizeData(clientesRes.data));
      setServices(normalizeData(serviciosRes.data));
      setUsers(normalizeData(empleadosRes.data));

    } catch (err) {
      console.error("Error en fetchData:", err.response?.data || err.message);
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

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

  // Validar que todos los campos requeridos estén completos
  const validarFormulario = () => {
    const { cliente_id, servicio_id, empleado_id, fecha, hora } = formData;

    if (!cliente_id || !servicio_id || !empleado_id || !fecha || !hora) {
      setToast("❌ Por favor completa todos los campos requeridos");
      return false;
    }

    if (!validarFechaHora(fecha, hora)) {
      setToast("❌ No puedes registrar una cita en una fecha u hora que ya pasó");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validarFormulario()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (editAppointment) {
        await appointmentsAPI.update(editAppointment.id, formData);
        setToast("✅ Cita actualizada exitosamente");
      } else {
        await appointmentsAPI.create(formData);
        setToast("✅ Cita registrada exitosamente");
      }

      // Recargar datos de la página actual
      fetchData(currentPage);
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
      // Recargar datos de la página actual
      fetchData(currentPage);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al eliminar cita";
      setToast(`❌ ${errorMessage}`);
    }
  };

  const openEditModal = (appointment) => {
    setEditAppointment(appointment);
    setFormData({
      cliente_id: appointment.cliente_id,
      servicio_id: appointment.servicio_id,
      empleado_id: appointment.empleado_id,
      fecha: appointment.fecha,
      hora: formatHora(appointment.hora),
      estado: appointment.estado,
      notas: appointment.notas || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAppointment(null);
    setFormData(INITIAL_FORM_STATE);
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
    setConfirmCancel(appointment);
  };

  const filteredAppointments = useMemo(() => {
    if (!search) return appointments;

    const term = search.toLowerCase();
    return appointments.filter((a) =>
      a.cliente?.toLowerCase().includes(term) ||
      a.servicio?.toLowerCase().includes(term) ||
      a.empleado?.toLowerCase().includes(term) ||
      a.fecha?.toLowerCase().includes(term)
    );
  }, [appointments, search]);

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
                {filteredAppointments.map((a) => (
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

            {/* Controles de paginación */}
            {pagination.last_page > 1 && (
              <div className="pagination-controls" style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: "10px", padding: "8px 12px" }}
                >
                  ← Anterior
                </button>

                <span style={{ margin: "0 15px", fontSize: "14px" }}>
                  Página {pagination.current_page} de {pagination.last_page}
                  ({pagination.total} citas)
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                  disabled={currentPage === pagination.last_page}
                  style={{ marginLeft: "10px", padding: "8px 12px" }}
                >
                  Siguiente →
                </button>
              </div>
            )}
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
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
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
                  value={formData.servicio_id}
                  onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
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
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Empleado</label>
                <select
                  value={formData.empleado_id}
                  onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
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
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
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

        {confirmCancel && (
          <Modal
            isOpen={!!confirmCancel}
            onClose={() => setConfirmCancel(null)}
            hideCloseButton
            actions={
              <>
                <button
                  className="btn-confirm"
                  onClick={() => {
                    handleEstadoChange(confirmCancel.id, "cancelada");
                    setToast("🚫 Cita cancelada");
                    setConfirmCancel(null);
                  }}>
                  Sí
                </button>
                <button className="btn-cancel" onClick={() => setConfirmCancel(null)}>
                  No
                </button>
              </>
            }>
            <div className="delete-client-text">
              {confirmCancel ? `¿Cancelar la cita de ${confirmCancel.cliente}?` : ""}
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