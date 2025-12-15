import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { clientsAPI } from "../api/clientesAPI";
import { useAuth } from "../context/AuthContext";
import "../styles/Clients.css";
import Modal from "../components/Modal";
import { FaHistory, FaTrashAlt, FaUserCheck } from "react-icons/fa";

const Clients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Estados para historial
    const [historyModal, setHistoryModal] = useState(false);
    const [selectedClientHistory, setSelectedClientHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Formulario modal
    const [nombre, setName] = useState("");
    const [telefono, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [direccion, setAddress] = useState("");
    const [toast, setToast] = useState("");

    // Estados para validación en tiempo real
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredClients(clients);
        } else {
            const lower = search.toLowerCase();
            setFilteredClients(
                clients.filter(
                    c =>
                        c.nombre.toLowerCase().includes(lower) ||
                        c.email?.toLowerCase().includes(lower) ||
                        c.telefono?.toLowerCase().includes(lower)
                )
            );
        }
    }, [search, clients]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await clientsAPI.getAll();
            setClients(res.data);
            setFilteredClients(res.data);
        } catch (err) {
            setError("Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editClient) {
                await clientsAPI.update(editClient.id, { nombre, telefono, email, direccion });
                showToast("✅ Cliente actualizado");
            } else {
                await clientsAPI.create({ nombre, telefono, email, direccion });
                showToast("✅ Cliente registrado");
            }
            fetchClients();
            closeModal();
        } catch (err) {
            // Capturar errores del backend
            if (err.response?.status === 422) {
                // Errores de validación
                const errors = err.response.data?.errors || {};
                let errorMessage = "";

                if (errors.email) {
                    errorMessage = errors.email[0]; // "The email has already been taken."
                } else if (errors.telefono) {
                    errorMessage = errors.telefono[0]; // "The telefono has already been taken."
                } else if (errors.nombre) {
                    errorMessage = errors.nombre[0];
                } else if (errors.direccion) {
                    errorMessage = errors.direccion[0];
                } else {
                    errorMessage = err.response.data?.message || "Error de validación";
                }

                showToast(`❌ ${errorMessage}`);
            } else if (err.response?.status === 500) {
                showToast(`❌ ${err.response.data?.message || "Error del servidor"}`);
            } else {
                showToast("❌ Error al guardar cliente");
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await clientsAPI.delete(id);
            showToast("✅ Cliente eliminado");
            fetchClients();
        } catch {
            showToast("❌ Error al eliminar cliente");
        }
    };

    const openEditModal = (client) => {
        setEditClient(client);
        setName(client.nombre);
        setEmail(client.email || "");
        setPhone(client.telefono || "");
        setAddress(client.direccion || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditClient(null);
        setName(""); setEmail(""); setPhone(""); setAddress("");
        setErrors({});
        setTouched({});
    };

    // Validar campos en tiempo real
    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };

        switch (fieldName) {
            case "nombre":
                if (!value.trim()) {
                    newErrors.nombre = "El nombre es requerido";
                } else if (value.length < 3) {
                    newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
                } else {
                    delete newErrors.nombre;
                }
                break;

            case "email":
                if (!value.trim()) {
                    newErrors.email = "El email es requerido";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = "Email inválido";
                } else if (clients.some(c => c.email?.toLowerCase() === value.toLowerCase() && (!editClient || c.id !== editClient.id))) {
                    newErrors.email = "Este email ya está registrado";
                } else {
                    delete newErrors.email;
                }
                break;

            case "telefono":
                if (value && !/^\d+$/.test(value)) {
                    newErrors.telefono = "El teléfono solo debe contener números";
                } else if (value && value.length < 7) {
                    newErrors.telefono = "El teléfono debe tener al menos 7 dígitos";
                } else if (value && clients.some(c => c.telefono === value && (!editClient || c.id !== editClient.id))) {
                    newErrors.telefono = "Este teléfono ya está registrado";
                } else {
                    delete newErrors.telefono;
                }
                break;

            case "direccion":
                if (!value.trim()) {
                    newErrors.direccion = "La dirección es requerida";
                } else if (value.length < 5) {
                    newErrors.direccion = "La dirección debe tener al menos 5 caracteres";
                } else {
                    delete newErrors.direccion;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    // Manejar cambio en inputs con validación
    const handleFieldChange = (fieldName, value) => {
        switch (fieldName) {
            case "nombre":
                setName(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "telefono":
                // Solo permitir números
                const onlyNumbers = value.replace(/\D/g, "");
                setPhone(onlyNumbers);
                validateField("telefono", onlyNumbers);
                return;
            case "direccion":
                setAddress(value);
                break;
            default:
                break;
        }

        // Validar si el campo ha sido tocado
        if (touched[fieldName]) {
            validateField(fieldName, value);
        }
    };

    // Marcar campo como tocado
    const handleFieldBlur = (fieldName) => {
        setTouched({ ...touched, [fieldName]: true });
        validateField(fieldName, fieldName === "nombre" ? nombre : fieldName === "email" ? email : fieldName === "telefono" ? telefono : direccion);
    };



    // Obtener historial del cliente
    const fetchClientHistory = async (clientId) => {
        setHistoryLoading(true);
        try {
            const res = await clientsAPI.getHistory(clientId);
            setSelectedClientHistory(res.data);
            setHistoryModal(true);
        } catch (err) {
            console.error("Error al cargar historial:", err);
            showToast("❌ Error al cargar historial del cliente");
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setHistoryModal(false);
        setSelectedClientHistory(null);
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <main className="clients-content">
                <header className="clients-header">
                    <h1>👥 Clientes</h1>
                    <div className="clients-actions">
                        <input
                            type="text"
                            placeholder="🔍 Buscar cliente..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                            ➕ Nuevo Cliente
                        </button>
                    </div>
                </header>

                {loading ? (
                    <p>Cargando...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Dirección</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.nombre}</td>
                                        <td>{c.email}</td>
                                        <td>{c.telefono}</td>
                                        <td>{c.direccion}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => openEditModal(c)}><FaUserCheck /> Editar</button>
                                            <button className="btn-history" onClick={() => fetchClientHistory(c.id)}><FaHistory />  Historial</button>
                                            <button className="btn-delete" onClick={() => setConfirmDelete(c)}><FaTrashAlt />  Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal de registro / edición */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editClient ? "✍ Editar Cliente" : "➕ Nuevo Cliente"}>
                    <form onSubmit={handleSubmit} className="form-client">
                        <div className="form-grid">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={e => handleFieldChange("nombre", e.target.value)}
                                        onBlur={() => handleFieldBlur("nombre")}
                                        className={errors.nombre && touched.nombre ? "input-error" : ""}
                                        required
                                    />
                                    {errors.nombre && touched.nombre && <span className="error-text">⚠️ {errors.nombre}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={telefono}
                                        onChange={e => handleFieldChange("telefono", e.target.value)}
                                        onBlur={() => handleFieldBlur("telefono")}
                                        placeholder="Ej: 1234567890"
                                        className={errors.telefono && touched.telefono ? "input-error" : ""}
                                    />
                                    {errors.telefono && touched.telefono && <span className="error-text">⚠️ {errors.telefono}</span>}
                                </div>
                            </div>

                            {/* 🔹 Email */}
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => handleFieldChange("email", e.target.value)}
                                    onBlur={() => handleFieldBlur("email")}
                                    className={errors.email && touched.email ? "input-error" : ""}
                                    required
                                />
                                {errors.email && touched.email && <span className="error-text">⚠️ {errors.email}</span>}
                            </div>

                            {/* 🔹 Dirección */}
                            <div className="form-group form-full">
                                <label>Dirección</label>
                                <textarea
                                    value={direccion}
                                    onChange={e => handleFieldChange("direccion", e.target.value)}
                                    onBlur={() => handleFieldBlur("direccion")}
                                    className={errors.direccion && touched.direccion ? "input-error" : ""}
                                />
                                {errors.direccion && touched.direccion && <span className="error-text">⚠️ {errors.direccion}</span>}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="submit" className="btn-submit">
                                {editClient ? "Actualizar" : "Registrar"}
                            </button>
                        </div>
                    </form>
                </Modal>


                {/* Modal de confirmación de eliminación */}
                <Modal
                    isOpen={confirmDelete !== null}
                    onClose={() => setConfirmDelete(null)} 
                    // title="¿Eliminar cliente?"
                    hideCloseButton={true}
                    actions={
                        <>
                            <button
                                className="btn-confirm"
                                onClick={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}>
                                Sí
                            </button>
                            <button
                                className="btn-cancel"
                                onClick={() => setConfirmDelete(null)}>
                                No
                            </button> 
                        </>
                    }>
                    <div className="delete-client-text">{confirmDelete ? `¿Eliminar al Cliente ${confirmDelete.nombre}?` : ""}</div>
                </Modal>


                {/* Modal de Historial */}
                <Modal
                    isOpen={historyModal}
                    onClose={closeHistoryModal}
                    title={selectedClientHistory ? `Historial - ${selectedClientHistory.cliente.nombre}` : "Historial"}
                    size="large">
                    {historyLoading ? (
                        <p>Cargando historial...</p>
                    ) : selectedClientHistory ? (
                        <div className="history-container">
                            {/* Resumen */}
                            <div className="history-summary">
                                <div className="summary-item">
                                    <span className="label">Total Citas:</span>
                                    <span className="value">{selectedClientHistory.total_citas}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Total Ventas:</span>
                                    <span className="value">{selectedClientHistory.total_ventas}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Monto Total:</span>
                                    <span className="value">${parseFloat(selectedClientHistory.monto_total || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Citas */}
                            <div className="history-section">
                                <h3>📅 Citas</h3>
                                {selectedClientHistory.citas.length > 0 ? (
                                    <table className="history-client-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>Servicio</th>
                                                <th>Empleado</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedClientHistory.citas.map(cita => (
                                                <tr key={cita.id}>
                                                    <td>{cita.fecha}</td>
                                                    <td>{cita.hora}</td>
                                                    <td>{cita.servicio?.nombre}</td>
                                                    <td>{cita.empleado?.name}</td>
                                                    <td><span className={`status-${cita.estado}`}>{cita.estado}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">No hay citas registradas</p>
                                )}
                            </div>

                            {/* Ventas */}
                            <div className="history-section">
                                <h3>💰 Ventas</h3>
                                {selectedClientHistory.ventas.length > 0 ? (
                                    <table className="history-client-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Mét. Pago</th>
                                                <th>Vendedor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedClientHistory.ventas.map(venta => (
                                                <tr key={venta.id}>
                                                    <td>{venta.fecha}</td>
                                                    <td>${parseFloat(venta.total).toFixed(2)}</td>
                                                    <td>{venta.metodo_pago}</td>
                                                    <td>{venta.usuario?.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">No hay ventas registradas</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </Modal>

                {toast && <div className="toast">{toast}</div>}
            </main>
        </div>
    );
};

export default Clients;
