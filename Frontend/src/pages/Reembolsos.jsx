import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import reembolsosAPI from '../services/reembolsosAPI';
import { useAuth } from '../context/AuthContext';
import '../styles/Reembolsos.css';

const Reembolsos = () => {
    const { user } = useAuth();
    const [reembolsos, setReembolsos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReembolso, setSelectedReembolso] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comentario, setComentario] = useState('');
    const [toast, setToast] = useState('');

    const isAdmin = user?.role?.name === 'admin';

    useEffect(() => {
        fetchReembolsos();
    }, []);

    const fetchReembolsos = async () => {
        try {
            const res = await reembolsosAPI.getAll();
            setReembolsos(res.data.reembolsos);
        } catch (err) {
            console.error('Error cargando reembolsos:', err);
            showToast('❌ Error al cargar reembolsos');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleOpenModal = (reembolso) => {
        setSelectedReembolso(reembolso);
        setComentario('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedReembolso(null);
        setComentario('');
        setIsModalOpen(false);
    };

    const handleAprobar = async () => {
        if (!selectedReembolso) return;

        try {
            await reembolsosAPI.updateEstado(selectedReembolso.id, {
                estado: 'aprobado',
                comentario_admin: comentario
            });
            showToast('✅ Reembolso aprobado e inventario restaurado');
            fetchReembolsos();
            handleCloseModal();
        } catch (err) {
            console.error('Error aprobando reembolso:', err);
            showToast('❌ Error al aprobar reembolso');
        }
    };

    const handleRechazar = async () => {
        if (!selectedReembolso) return;

        if (!comentario.trim()) {
            showToast('⚠️ Debes proporcionar un motivo para rechazar');
            return;
        }

        try {
            await reembolsosAPI.updateEstado(selectedReembolso.id, {
                estado: 'rechazado',
                comentario_admin: comentario
            });
            showToast('✅ Reembolso rechazado');
            fetchReembolsos();
            handleCloseModal();
        } catch (err) {
            console.error('Error rechazando reembolso:', err);
            showToast('❌ Error al rechazar reembolso');
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { class: 'badge-pendiente', text: '⏳ Pendiente' },
            aprobado: { class: 'badge-aprobado', text: '✅ Aprobado' },
            rechazado: { class: 'badge-rechazado', text: '❌ Rechazado' }
        };
        return badges[estado] || badges.pendiente;
    };

    const filteredReembolsos = isAdmin 
        ? reembolsos 
        : reembolsos.filter(r => r.solicitado_por === user?.id);

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="reembolsos-content">
                <header className="reembolsos-header">
                    <h1>💰 Gestión de Reembolsos</h1>
                    {isAdmin && (
                        <div className="stats-summary">
                            <div className="stat-item">
                                <span className="stat-label">Pendientes:</span>
                                <span className="stat-value">{reembolsos.filter(r => r.estado === 'pendiente').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Aprobados:</span>
                                <span className="stat-value">{reembolsos.filter(r => r.estado === 'aprobado').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Rechazados:</span>
                                <span className="stat-value">{reembolsos.filter(r => r.estado === 'rechazado').length}</span>
                            </div>
                        </div>
                    )}
                </header>

                {toast && <div className="toast">{toast}</div>}

                {loading ? (
                    <p>Cargando...</p>
                ) : filteredReembolsos.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 No hay solicitudes de reembolso</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="reembolsos-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Venta #</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                    <th>Solicitado por</th>
                                    <th>Fecha Solicitud</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReembolsos.map((reembolso) => {
                                    const badge = getEstadoBadge(reembolso.estado);
                                    return (
                                        <tr key={reembolso.id}>
                                            <td>{reembolso.id}</td>
                                            <td>#{reembolso.venta_id}</td>
                                            <td>{reembolso.venta?.cliente?.nombre || 'N/A'}</td>
                                            <td className="monto-cell">${parseFloat(reembolso.monto).toFixed(2)}</td>
                                            <td>{reembolso.solicitante?.name || 'N/A'}</td>
                                            <td>{new Date(reembolso.fecha_solicitud).toLocaleDateString('es-MX')}</td>
                                            <td>
                                                <span className={`badge ${badge.class}`}>
                                                    {badge.text}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleOpenModal(reembolso)}
                                                    title="Ver detalles"
                                                >
                                                    👁️ Ver
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal de detalles */}
                {selectedReembolso && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        title={`Reembolso #${selectedReembolso.id}`}
                    >
                        <div className="reembolso-details">
                            <div className="detail-section">
                                <h3>📋 Información General</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Venta:</span>
                                        <span className="detail-value">#{selectedReembolso.venta_id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Cliente:</span>
                                        <span className="detail-value">{selectedReembolso.venta?.cliente?.nombre || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Monto:</span>
                                        <span className="detail-value">${parseFloat(selectedReembolso.monto).toFixed(2)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Estado:</span>
                                        <span className={`badge ${getEstadoBadge(selectedReembolso.estado).class}`}>
                                            {getEstadoBadge(selectedReembolso.estado).text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>📝 Motivo de la Solicitud</h3>
                                <p className="motivo-text">{selectedReembolso.motivo}</p>
                            </div>

                            <div className="detail-section">
                                <h3>👤 Información de Gestión</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Solicitado por:</span>
                                        <span className="detail-value">{selectedReembolso.solicitante?.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Fecha solicitud:</span>
                                        <span className="detail-value">
                                            {new Date(selectedReembolso.fecha_solicitud).toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                    {selectedReembolso.autorizado_por && (
                                        <>
                                            <div className="detail-item">
                                                <span className="detail-label">Autorizado por:</span>
                                                <span className="detail-value">{selectedReembolso.autorizador?.name || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Fecha respuesta:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedReembolso.fecha_respuesta).toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {selectedReembolso.comentario_admin && (
                                <div className="detail-section">
                                    <h3>💬 Comentario del Administrador</h3>
                                    <p className="comentario-text">{selectedReembolso.comentario_admin}</p>
                                </div>
                            )}

                            {isAdmin && selectedReembolso.estado === 'pendiente' && (
                                <div className="detail-section">
                                    <h3>✍️ Responder Solicitud</h3>
                                    <textarea
                                        className="comentario-input"
                                        placeholder="Comentario (opcional para aprobar, requerido para rechazar)"
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        rows={4}
                                    />
                                    <div className="action-buttons">
                                        <button className="btn-aprobar" onClick={handleAprobar}>
                                            ✅ Aprobar Reembolso
                                        </button>
                                        <button className="btn-rechazar" onClick={handleRechazar}>
                                            ❌ Rechazar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </main>
        </div>
    );
};

export default Reembolsos;

