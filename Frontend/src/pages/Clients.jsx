import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { clientsAPI } from "../api/clientesAPI";
import { useAuth } from "../context/AuthContext";
import "../styles/Clients.css";
import Modal from "../components/Modal";

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

    // Formulario modal
    const [nombre, setName] = useState("");
    const [telefono, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [direccion, setAddress] = useState("");
    const [toast, setToast] = useState("");

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

        const emailExists = clients.some(
            c => c.email?.toLowerCase() === email.toLowerCase() && (!editClient || c.id !== editClient.id)
        );

        if (emailExists) {
            showToast("❌ Este correo ya está registrado");
            return;
        }

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
            showToast("❌ Error al guardar cliente");
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
                                            <button className="btn-edit" onClick={() => openEditModal(c)}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => setConfirmDelete(c)}>🗑 Eliminar</button>
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
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group form-full">
                                <label>Dirección</label>
                                <textarea
                                    value={direccion}
                                    onChange={e => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={closeModal}>
                                Cancelar
                            </button>
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
                    title={`¿Eliminar cliente ${confirmDelete?.nombre}?`}
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
                    }
                />

                {toast && <div className="toast">{toast}</div>}
            </main>
        </div>
    );
};

export default Clients;
