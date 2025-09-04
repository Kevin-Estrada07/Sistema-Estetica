import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { servicesAPI } from "../api/serviciosAPI";
import { useAuth } from "../context/AuthContext";
import "../styles/Services.css";
import Modal from "../components/Modal";

const Services = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editService, setEditService] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [nombre, setName] = useState("");
    const [descripcion, setDescription] = useState("");
    const [duracion, setDuration] = useState("");
    const [precio, setPrice] = useState("");
    const [toast, setToast] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            await fetchServices();
        };
        fetchData();
    }, []);


    useEffect(() => {
        if (search.trim() === "") {
            setFilteredServices(services);
        } else {
            const lower = search.toLowerCase();
            setFilteredServices(
                services.filter(s =>
                    s.nombre.toLowerCase().includes(lower)
                )
            );
        }
    }, [search, services]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await servicesAPI.getAll();
            setServices(res.data);
            setFilteredServices(res.data);
            
        } catch {
            setError("Error al cargar servicios");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        const timer = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(timer);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameExists = services.some(
            s => s.nombre?.toLowerCase() === nombre.toLowerCase() && (!editService || s.id !== editService.id)
        );

        if (nameExists) {
            showToast("❌ Esta Servicio ya está registrado");
            return;
        }

        try {
            if (editService) {
                await servicesAPI.update(editService.id, { nombre, descripcion, duracion, precio });
                showToast("✅ Servicio actualizado");
            } else {
                await servicesAPI.create({ nombre, descripcion, duracion, precio });
                showToast("✅ Servicio registrado");
            }
            fetchServices();
            closeModal();
        } catch {
            showToast("❌ Error al crear el servicio");
        }
    };

    const handleDelete = async (id) => {
        try {
            await servicesAPI.delete(id);
            showToast("✅ Servicio eliminado");
            fetchServices();
        } catch {
            showToast("❌ Error al eliminar servicio");
        }
    };

    const openEditModal = (service) => {
        setEditService(service);
        setName(service.nombre);
        setDescription(service.descripcion || "");
        setDuration(service.duracion || "");
        setPrice(service.precio || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditService(null);
        setName(""); setDescription(""); setDuration(""); setPrice("");
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <main className="services-content">
                <header className="services-header">
                    <h1>💅 Servicios</h1>
                    <div className="services-actions">
                        <input
                            type="text"
                            placeholder="🔍 Buscar servicio..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn-register" onClick={() => setIsModalOpen(true)}>
                            ➕ Nuevo Servicio
                        </button>
                    </div>
                </header>

                {loading ? <p>Cargando...</p> : error ? <p>{error}</p> :
                    <div className="table-wrapper">
                        <table className="services-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Duración</th>
                                    <th>Precio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.nombre}</td>
                                        <td>{s.descripcion}</td>
                                        <td>{s.duracion}</td>
                                        <td>{s.precio}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => openEditModal(s)}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => setConfirmDelete(s)}>🗑 Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }

                {/* Modal Registro / Edición */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editService ? "✍ Editar Servicio" : "✍ Nuevo Servicio"}>
                    <form onSubmit={handleSubmit} className="form-client">
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
                            <label>Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Duración</label>
                            <input
                                type="number"
                                value={duracion}
                                onChange={e => setDuration(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Precio</label>
                            <input
                                type="number"
                                value={precio}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-submit">
                            {editService ? "Actualizar" : "Registrar"}
                        </button>
                    </form>

                </Modal>

                {/* Modal Confirmación Eliminación */}
                <Modal
                    isOpen={confirmDelete !== null}
                    onClose={() => setConfirmDelete(null)}
                    title={confirmDelete ? `¿Eliminar servicio ${confirmDelete.nombre}?` : ""}
                    hideCloseButton={true}
                    actions={
                        <>
                            <button className="btn-confirm" onClick={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}>Sí</button>
                            <button className="btn-cancel" onClick={() => setConfirmDelete(confirmDelete.id)}>No</button>
                        </>
                    }
                />

                {toast && <div className="toast">{toast}</div>}
            </main>
        </div>
    );
};

export default Services;
