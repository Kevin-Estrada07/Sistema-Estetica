import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { salesAPI } from "../api/salesAPI";
import Modal from "../components/Modal";
import "../styles/SalesHistory.css";
import generatePDF from "../components/generatePDF";


const SalesHistory = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchVentas();
    }, []);

    const fetchVentas = async () => {
        try {
            const { data } = await salesAPI.getAll();
            setVentas(data.ventas || data);
        } catch (err) {
            console.error("Error cargando ventas:", err);
            setError("Error al cargar ventas");
        } finally {
            setLoading(false);
        }
    };

    const filteredVentas = Array.isArray(ventas)
        ? ventas.filter(
            (v) =>
                v.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                v.usuario?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const handleView = (venta) => {
        setSelectedVenta(venta);
        setIsModalOpen(true);
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="ventas-content">
                <header className="ventas-header">
                    <h1>🧾 Registro de Ventas</h1>
                    <div className="ventas-actions">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por cliente o usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </header>

                {loading ? (
                    <p>Cargando ventas...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="ventas-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Usuario</th>
                                    <th>Método de Pago</th>
                                    <th>Total</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVentas.map((venta) => (
                                    <tr key={venta.id}>
                                        <td>{venta.id}</td>
                                        <td>{venta.cliente?.nombre || "Invitado"}</td>
                                        <td>{venta.usuario?.name || "Desconocido"}</td>
                                        <td>{venta.metodo_pago}</td>
                                        <td>${venta.total}</td>
                                        <td>{new Date(venta.fecha).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn-view"
                                                onClick={() => handleView(venta)}>
                                                👁 Ver
                                            </button>
                                            <button
                                                className="btn-print"
                                                onClick={() => generatePDF(venta)}>
                                                🧾 Imprimir ticket
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL DE DETALLES DE VENTA */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={
                        selectedVenta
                            ? `Detalles de la Venta #${selectedVenta.id}`
                            : "Detalles de Venta"
                    }>
                    {selectedVenta && (
                        <div>
                            <p>
                                <strong>Cliente:</strong>{" "}
                                {selectedVenta.cliente?.nombre || "Invitado"}
                            </p>
                            <p>
                                <strong>Usuario:</strong>{" "}
                                {selectedVenta.usuario?.name || "Desconocido"}
                            </p>
                            <p>
                                <strong>Método de pago:</strong> {selectedVenta.metodo_pago}
                            </p>
                            <p>
                                <strong>Total:</strong> ${selectedVenta.total}
                            </p>

                            <hr />

                            {/* Servicios */}
                            {selectedVenta.detalles?.some((d) => d.servicio) && (
                                <>
                                    <h3>🧴 Servicios</h3>
                                    <table className="detalle-table">
                                        <thead>
                                            <tr>
                                                <th>Servicio</th>
                                                <th>Precio</th>
                                                <th>Cantidad</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedVenta.detalles
                                                .filter((d) => d.servicio)
                                                .map((d) => (
                                                    <tr key={d.id}>
                                                        <td>{d.servicio.nombre}</td>
                                                        <td>${d.precio_unitario}</td>
                                                        <td>{d.cantidad}</td>
                                                        <td>${d.subtotal}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Productos */}
                            {selectedVenta.detalles?.some((d) => d.producto) && (
                                <>
                                    <h3>📦 Productos</h3>
                                    <table className="detalle-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Precio</th>
                                                <th>Cantidad</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedVenta.detalles
                                                .filter((d) => d.producto)
                                                .map((d) => (
                                                    <tr key={d.id}>
                                                        <td>{d.producto.nombre}</td>
                                                        <td>${d.precio_unitario}</td>
                                                        <td>{d.cantidad}</td>
                                                        <td>${d.subtotal}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    )}
                </Modal>
            </main>
        </div>
    );
};

export default SalesHistory;
