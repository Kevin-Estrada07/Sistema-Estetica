import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaUserCheck } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import { appointmentsAPI } from "../api/appointmentsAPI";
import { clientsAPI } from "../api/clientesAPI";
import { servicesAPI } from "../api/serviciosAPI";
// import { adminAPI } from "../api/adminAPI";
import { empleadosAPI } from "../api/empleadosAPI";
import "../styles/Appointments.css";
import PaymentModal from "../components/PaymentModal";
import { productsAPI } from "../api/productsAPI";


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

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [a, c, s, e, p] = await Promise.all([
        appointmentsAPI.getAll(),
        clientsAPI.getAll(),
        servicesAPI.getAll(),
        empleadosAPI.getAll(),
        productsAPI.getAll()
      ]);

      console.log("Appointments:", a.data);
      console.log("Clients:", c.data);
      console.log("Services:", s.data);
      console.log("Empleados:", e.data);
      console.log("Products:", p.data);

      setAppointments(a.data);
      setClients(c.data);
      setServices(s.data);
      setUsers(e.data);
      setProducts(p.data);
    } catch (err) {
      console.error("Error en fetchData:", err.response?.data || err.message);
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setToast("✅ Cita actualizada");
      } else {
        await appointmentsAPI.create(data);
        setToast("✅ Cita registrada");
      }
      fetchData();
      closeModal();
    } catch {
      setToast("❌ Error al guardar cita");
    }
  };

  const handleDelete = async (id) => {
    try {
      await appointmentsAPI.delete(id);
      setToast("✅ Cita eliminada");
      fetchData();
    } catch {
      setToast("❌ Error al eliminar cita");
    }
  };

  const openEditModal = (appointment) => {
    setEditAppointment(appointment);
    setClienteId(appointment.cliente_id);
    setServicioId(appointment.servicio_id);
    setEmpleadoId(appointment.empleado_id);
    setFecha(appointment.fecha);
    setHora(appointment.hora);
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

  // // Para el pago
  // const openPaymentModal = (appointment) => {
  //   setSelectedAppointment(appointment);
  //   setIsPaymentModalOpen(true);
  // };

  const closePaymentModal = () => {
    setSelectedAppointment(null);
    setIsPaymentModalOpen(false);
  };


  const handleEstadoChange = async (id, newEstado) => {
    try {
      const appointment = appointments.find((a) => a.id === id);
      await appointmentsAPI.update(id, { ...appointment, estado: newEstado });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, estado: newEstado } : a))
      );
    } catch {
      setToast("❌ Error al actualizar estado");
    }
  };

  return (
    <div className="dashboard">
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
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  .filter((a) =>
                    search ? a.cliente?.nombre.toLowerCase().includes(search.toLowerCase()) : true
                  )
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.cliente?.nombre}</td>
                      <td>{a.servicio?.nombre}</td>
                      <td>{a.empleado?.name}</td>
                      <td>{a.fecha}</td>
                      <td>{a.hora}</td>
                      <td>
                        <select
                          value={a.estado}
                          onChange={(e) => handleEstadoChange(a.id, e.target.value)}>
                          <option value="pendiente">Pendiente</option>
                          <option value="en proceso">En Proceso</option>
                          <option value="completada">Completada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td>{a.notas}</td>
                      <td>
                        {/* <button className="btn-attend" onClick={() => openPaymentModal(a)}>
                          <FaUserCheck /> Pagar
                        </button> */}
                        <Link to={`/payment/${a.id}`} className="btn-attend">
                          <FaUserCheck /> Pagar
                        </Link>

                        <button className="btn-edit" onClick={() => openEditModal(a)}>
                          <FaEdit /> Editar
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
            <div className="form-group">
              <label>Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
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
              <select value={servicioId} onChange={(e) => setServicioId(e.target.value)} required>
                <option value="">Selecciona servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Empleado</label>
              <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} required>
                <option value="">Selecciona empleado</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="pendiente">Pendiente</option>
                <option value="en proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
            <button type="submit" className="btn-register">
              {editAppointment ? "Actualizar" : "Registrar"}
            </button>
          </form>
        </Modal>

        {confirmDelete && (
          <Modal
            isOpen={!!confirmDelete}
            onClose={() => setConfirmDelete(null)}
            title={`¿Eliminar cita de ${confirmDelete.cliente?.nombre}?`}
            hideCloseButton
            actions={
              <>
                <button
                  className="btn-delete"
                  onClick={() => {
                    handleDelete(confirmDelete.id);
                    setConfirmDelete(null);
                  }}>
                  Sí
                </button>
                <button onClick={() => setConfirmDelete(null)}>No</button>
              </>
            }
          />
        )}
        {/* Modal de pago */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          appointment={selectedAppointment}
          products={products || []}
        />

        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
};

export default Appointments;
