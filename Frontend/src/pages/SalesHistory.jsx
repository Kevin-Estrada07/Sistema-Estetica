import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { salesAPI } from "../api/salesAPI";
import reembolsosAPI from "../services/reembolsosAPI";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import "../styles/SalesHistory.css";
import generatePDF from "../components/generatePDF";


const SalesHistory = () => {
    const { user } = useAuth();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMethod, setFilterMethod] = useState("todos");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [viewMode, setViewMode] = useState("table"); // "table" o "cards"
    const [isReembolsoModalOpen, setIsReembolsoModalOpen] = useState(false);
    const [motivoReembolso, setMotivoReembolso] = useState("");
    const [toast, setToast] = useState("");

    const isAdmin = user?.role?.name === 'admin';

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
        ? ventas.filter((v) => {
            // Filtro por búsqueda
            const matchSearch =
                v.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                v.usuario?.name?.toLowerCase().includes(search.toLowerCase()) ||
                v.id.toString().includes(search);

            // Filtro por método de pago
            const matchMethod = filterMethod === "todos" || v.metodo_pago === filterMethod;

            // Filtro por fecha
            const ventaDate = new Date(v.fecha);
            const matchDateFrom = !dateFrom || ventaDate >= new Date(dateFrom);
            const matchDateTo = !dateTo || ventaDate <= new Date(dateTo + "T23:59:59");

            return matchSearch && matchMethod && matchDateFrom && matchDateTo;
        })
        : [];

    // Calcular estadísticas
    const totalVentas = filteredVentas.length;
    const totalMonto = filteredVentas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
    const promedioVenta = totalVentas > 0 ? totalMonto / totalVentas : 0;

    const handleView = (venta) => {
        setSelectedVenta(venta);
        setIsModalOpen(true);
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const handleOpenReembolsoModal = (venta) => {
        // ✅ Permitir a todos los usuarios autenticados solicitar reembolsos
        // Solo el admin puede aprobar/rechazar (en la página de Reembolsos)

        // Verificar si ya tiene un reembolso (aprobado, pendiente o rechazado)
        const tieneReembolso = venta.reembolsos && venta.reembolsos.length > 0;
        if (tieneReembolso) {
            const reembolso = venta.reembolsos[0];
            if (reembolso.estado === 'aprobado') {
                showToast('⚠️ Esta venta ya fue reembolsada');
            } else if (reembolso.estado === 'pendiente') {
                showToast('⚠️ Esta venta ya tiene una solicitud de reembolso pendiente');
            } else if (reembolso.estado === 'rechazado') {
                showToast('⚠️ Esta venta ya tiene un reembolso rechazado');
            }
            return;
        }

        setSelectedVenta(venta);
        setMotivoReembolso("");
        setIsReembolsoModalOpen(true);
    };

    const getReembolsoStatus = (venta) => {
        if (!venta.reembolsos || venta.reembolsos.length === 0) return null;

        // Buscar el reembolso más reciente
        const reembolso = venta.reembolsos[0];

        const badges = {
            pendiente: { class: 'reembolso-pendiente', icon: '⏳', text: 'Reembolso Pendiente' },
            aprobado: { class: 'reembolso-aprobado', icon: '✅', text: 'Reembolsado' },
            rechazado: { class: 'reembolso-rechazado', icon: '❌', text: 'Reembolso Rechazado' }
        };

        return badges[reembolso.estado] || null;
    };

    const handleCloseReembolsoModal = () => {
        setSelectedVenta(null);
        setMotivoReembolso("");
        setIsReembolsoModalOpen(false);
    };

    const handleSolicitarReembolso = async () => {
        if (!motivoReembolso.trim() || motivoReembolso.length < 10) {
            showToast("⚠️ El motivo debe tener al menos 10 caracteres");
            return;
        }

        try {
            const response = await reembolsosAPI.create({
                venta_id: selectedVenta.id,
                motivo: motivoReembolso
            });

            showToast("✅ Solicitud de reembolso enviada. Pendiente de autorización.");
            handleCloseReembolsoModal();

            // Actualizar la lista de ventas para mostrar el nuevo reembolso
            await fetchVentas();
        } catch (err) {
            console.error("Error solicitando reembolso:", err);
            const errorMsg = err.response?.data?.message || "Error al solicitar reembolso";
            showToast(`❌ ${errorMsg}`);
        }
    };

    return (
        <div className="dashboard sales-history-container">
            <Sidebar />
            <main className="ventas-content">
                <header className="ventas-header">
                    <div className="header-top">
                        <h1>🧾 Historial de Ventas</h1>
                        <div className="view-toggle">
                            <button
                                className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
                                onClick={() => setViewMode("table")}
                                title="Vista de tabla">
                                📋
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === "cards" ? "active" : ""}`}
                                onClick={() => setViewMode("cards")}
                                title="Vista de tarjetas">
                                🎴
                            </button>
                        </div>
                    </div>
                </header>

                {/* ESTADÍSTICAS */}
                <section className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <p className="stat-label">Total Ventas</p>
                            <p className="stat-value">{totalVentas}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <p className="stat-label">Monto Total</p>
                            <p className="stat-value">${totalMonto.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <p className="stat-label">Promedio</p>
                            <p className="stat-value">${promedioVenta.toFixed(2)}</p>
                        </div>
                    </div>
                </section>

                {/* FILTROS */}
                <section className="filters-section">
                    <div className="filter-group">
                        <label>🔍 Buscar</label>
                        <input
                            type="text"
                            placeholder="Cliente, usuario o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>💳 Método de Pago</label>
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="filter-select"
                        >
                            <option value="todos">Todos</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>📅 Desde</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>📅 Hasta</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>&nbsp;</label>
                        <button
                            className="btn-clear-filters"
                            onClick={() => {
                                setSearch("");
                                setFilterMethod("todos");
                                setDateFrom("");
                                setDateTo("");
                            }}
                        >
                            🔄 Limpiar
                        </button>
                    </div>
                </section>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner-large"></div>
                        <p>Cargando ventas...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>❌ {error}</p>
                    </div>
                ) : filteredVentas.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No se encontraron ventas</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : viewMode === "table" ? (
                    <div className="table-wrapper">
                        <table className="ventas-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Usuario</th>
                                    <th>Método de Pago</th>
                                    <th>Subtotal</th>
                                    <th>Descuento</th>
                                    <th>Impuesto</th>
                                    <th>Total</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVentas.map((venta) => (
                                    <tr key={venta.id}>
                                        <td>
                                            <span className="badge-id">#{venta.id}</span>
                                            {getReembolsoStatus(venta) && (
                                                <span className={`reembolso-badge ${getReembolsoStatus(venta).class}`}>
                                                    {getReembolsoStatus(venta).icon} {getReembolsoStatus(venta).text}
                                                </span>
                                            )}
                                        </td>
                                        <td>{venta.cliente?.nombre || "Invitado"}</td>
                                        <td>{venta.usuario?.name || "Desconocido"}</td>
                                        <td>
                                            <span className={`badge-method ${venta.metodo_pago}`}>
                                                {venta.metodo_pago === "efectivo" && "💵"}
                                                {venta.metodo_pago === "tarjeta" && "💳"}
                                                {venta.metodo_pago === "transferencia" && "🏦"}
                                                {" "}{venta.metodo_pago}
                                            </span>
                                        </td>
                                        <td>${parseFloat(venta.subtotal || 0).toFixed(2)}</td>
                                        <td className="discount-cell">
                                            {venta.descuento_monto > 0 ? (
                                                <span className="discount-badge">
                                                    -${parseFloat(venta.descuento_monto).toFixed(2)}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="tax-cell">
                                            {venta.impuesto_monto > 0 ? (
                                                <span className="tax-badge">
                                                    +${parseFloat(venta.impuesto_monto).toFixed(2)}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="total-cell">
                                            {venta.reembolsado ? (
                                                <>
                                                    <span className="total-original">${parseFloat(venta.total_original).toFixed(2)}</span>
                                                    <span className="total-reembolsado">$0.00</span>
                                                </>
                                            ) : (
                                                `$${parseFloat(venta.total).toFixed(2)}`
                                            )}
                                        </td>
                                        <td>{new Date(venta.fecha).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleView(venta)}
                                                    title="Ver detalles"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn-print"
                                                    onClick={() => generatePDF(venta)}
                                                    title="Imprimir ticket"
                                                >
                                                    🖨️
                                                </button>
                                                {/* Solo mostrar botón de reembolso si no tiene reembolso */}
                                                {(!venta.reembolsos || venta.reembolsos.length === 0) && (
                                                    <button
                                                        className="btn-refund"
                                                        onClick={() => handleOpenReembolsoModal(venta)}
                                                        title="Solicitar reembolso"
                                                    >
                                                        💰
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {filteredVentas.map((venta) => (
                            <div key={venta.id} className="venta-card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        <span className="card-id">#{venta.id}</span>
                                        {getReembolsoStatus(venta) && (
                                            <span className={`reembolso-badge-card ${getReembolsoStatus(venta).class}`}>
                                                {getReembolsoStatus(venta).icon}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`card-method ${venta.metodo_pago}`}>
                                        {venta.metodo_pago === "efectivo" && "💵"}
                                        {venta.metodo_pago === "tarjeta" && "💳"}
                                        {venta.metodo_pago === "transferencia" && "🏦"}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="card-info">
                                        <p className="card-label">Cliente</p>
                                        <p className="card-value">{venta.cliente?.nombre || "Invitado"}</p>
                                    </div>
                                    <div className="card-info">
                                        <p className="card-label">Atendió</p>
                                        <p className="card-value">{venta.usuario?.name || "Desconocido"}</p>
                                    </div>
                                    <div className="card-info">
                                        <p className="card-label">Fecha</p>
                                        <p className="card-value">{new Date(venta.fecha).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    <div className="card-totals">
                                        {venta.descuento_monto > 0 && (
                                            <div className="card-discount">
                                                <span>Descuento:</span>
                                                <span>-${parseFloat(venta.descuento_monto).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {venta.impuesto_monto > 0 && (
                                            <div className="card-tax">
                                                <span>Impuesto:</span>
                                                <span>+${parseFloat(venta.impuesto_monto).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="card-total">
                                            <span>Total:</span>
                                            {venta.reembolsado ? (
                                                <span>
                                                    <span className="total-original">${parseFloat(venta.total_original).toFixed(2)}</span>
                                                    {" "}
                                                    <span className="total-reembolsado">$0.00</span>
                                                </span>
                                            ) : (
                                                <span>${parseFloat(venta.total).toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="btn-view-card"
                                        onClick={() => handleView(venta)}
                                    >
                                        👁️ Ver Detalles
                                    </button>
                                    <button
                                        className="btn-print-card"
                                        onClick={() => generatePDF(venta)}
                                    >
                                        🖨️ Ticket
                                    </button>
                                    {/* Solo mostrar botón de reembolso si no tiene reembolso */}
                                    {(!venta.reembolsos || venta.reembolsos.length === 0) && (
                                        <button
                                            className="btn-refund-card"
                                            onClick={() => handleOpenReembolsoModal(venta)}
                                        >
                                            💰 Reembolso
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
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
                        <div className="modal-venta-details">
                            <div className="detail-section">
                                <h3>📋 Información General</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Cliente:</span>
                                        <span className="detail-value">{selectedVenta.cliente?.nombre || "Invitado"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Atendió:</span>
                                        <span className="detail-value">{selectedVenta.usuario?.name || "Desconocido"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Método de pago:</span>
                                        <span className="detail-value">
                                            <span className={`badge-method ${selectedVenta.metodo_pago}`}>
                                                {selectedVenta.metodo_pago}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Fecha:</span>
                                        <span className="detail-value">
                                            {new Date(selectedVenta.fecha).toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                </div>
                            </div>

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
                                <div className="detail-section">
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
                                                        <td>${parseFloat(d.precio_unitario).toFixed(2)}</td>
                                                        <td>{d.cantidad}</td>
                                                        <td>${parseFloat(d.subtotal).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Resumen de Totales */}
                            <div className="detail-section">
                                <h3>💰 Resumen de Pago</h3>
                                <div className="totals-summary">
                                    <div className="total-row">
                                        <span>Subtotal:</span>
                                        <span>${parseFloat(selectedVenta.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    {selectedVenta.descuento_monto > 0 && (
                                        <div className="total-row discount">
                                            <span>Descuento ({selectedVenta.descuento_porcentaje}%):</span>
                                            <span>-${parseFloat(selectedVenta.descuento_monto).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {selectedVenta.impuesto_monto > 0 && (
                                        <div className="total-row tax">
                                            <span>Impuesto ({selectedVenta.impuesto_porcentaje}%):</span>
                                            <span>+${parseFloat(selectedVenta.impuesto_monto).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="total-row final">
                                        <span>Total:</span>
                                        <span>
                                            {selectedVenta.reembolsado ? (
                                                <>
                                                    <span className="total-original">${parseFloat(selectedVenta.total_original).toFixed(2)}</span>
                                                    {" "}
                                                    <span className="total-reembolsado">$0.00</span>
                                                </>
                                            ) : (
                                                `$${parseFloat(selectedVenta.total).toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información de Reembolso */}
                            {selectedVenta.reembolsos && selectedVenta.reembolsos.length > 0 && (
                                <div className="detail-section reembolso-section">
                                    <h3>🔄 Estado de Reembolso</h3>
                                    {selectedVenta.reembolsos.map((reembolso) => (
                                        <div key={reembolso.id} className={`reembolso-info-box ${reembolso.estado}`}>
                                            <div className="reembolso-status">
                                                {reembolso.estado === 'pendiente' && '⏳ Pendiente de Autorización'}
                                                {reembolso.estado === 'aprobado' && '✅ Reembolso Aprobado'}
                                                {reembolso.estado === 'rechazado' && '❌ Reembolso Rechazado'}
                                            </div>
                                            <div className="reembolso-details">
                                                <p><strong>Monto:</strong> ${parseFloat(reembolso.monto).toFixed(2)}</p>
                                                <p><strong>Fecha de solicitud:</strong> {new Date(reembolso.fecha_solicitud).toLocaleString('es-MX')}</p>
                                                {reembolso.fecha_respuesta && (
                                                    <p><strong>Fecha de respuesta:</strong> {new Date(reembolso.fecha_respuesta).toLocaleString('es-MX')}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Modal de solicitud de reembolso */}
                <Modal
                    isOpen={isReembolsoModalOpen}
                    onClose={handleCloseReembolsoModal}
                    title="💰 Solicitar Reembolso">
                    {selectedVenta && (
                        <div className="reembolso-form">
                            <div className="reembolso-info">
                                <p><strong>Venta:</strong> #{selectedVenta.id}</p>
                                <p><strong>Cliente:</strong> {selectedVenta.cliente?.nombre || "Invitado"}</p>
                                <p><strong>Monto:</strong> ${parseFloat(selectedVenta.total).toFixed(2)}</p>
                            </div>
                            <div className="form-group">
                                <label>Motivo del reembolso (mínimo 10 caracteres):</label>
                                <textarea
                                    value={motivoReembolso}
                                    onChange={(e) => setMotivoReembolso(e.target.value)}
                                    placeholder="Describe el motivo de la solicitud de reembolso..."
                                    rows={5}
                                    className="motivo-textarea"
                                />
                                <small className="char-count">
                                    {motivoReembolso.length} / 10 caracteres mínimo
                                </small>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn-submit-refund"
                                    onClick={handleSolicitarReembolso}
                                    disabled={motivoReembolso.length < 10}
                                >
                                    ✅ Enviar Solicitud
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={handleCloseReembolsoModal}
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Toast de notificaciones */}
                {toast && <div className="toast">{toast}</div>}
            </main>
        </div>
    );
};

export default SalesHistory;
