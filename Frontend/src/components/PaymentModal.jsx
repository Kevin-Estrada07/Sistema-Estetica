import React, { useState, useEffect } from "react";
import "../styles/PaymentModal.css";
import { useAuth } from "../context/AuthContext";

const PaymentModal = ({ isOpen, onClose, appointment, onPay, products }) => {
    const { user } = useAuth();

    const [paymentMethod, setPaymentMethod] = useState("efectivo");
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedProducts([]);
            setPaymentMethod("efectivo");
        }
    }, [isOpen]);

    if (!isOpen || !appointment) return null;

    const handleQuantityChange = (prod, cantidad) => {
        if (cantidad < 0) cantidad = 0;
        if (cantidad > prod.cantidad) cantidad = prod.cantidad;

        setSelectedProducts((prev) => {
            const exists = prev.find((p) => p.id === prod.id);
            if (exists) {
                return prev.map((p) =>
                    p.id === prod.id ? { ...p, cantidad } : p
                );
            }
            return [...prev, { ...prod, cantidad }];
        });
    };

    const totalServicio = Number(appointment.servicio?.precio || 0);

    const totalProductos = selectedProducts.reduce(
        (acc, p) => acc + Number(p.precio_unitario) * p.cantidad,
        0
    );

    const total = totalServicio + totalProductos;




    const handlePay = () => {
        const filteredProducts = selectedProducts.filter((p) => p.cantidad > 0);
        onPay({
            appointmentId: appointment.id,
            paymentMethod,
            products: filteredProducts,
            total,
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content payment-modal">
                <h2 className="modal-title">💳 Pagar Servicio</h2>

                <div className="appointment-info">
                    <p><strong>Cliente:</strong> {appointment.cliente?.nombre}</p>
                    <p><strong>Servicio:</strong> {appointment.servicio?.nombre} — ${appointment.servicio?.precio}</p>
                    <p><strong>Fecha:</strong> {appointment.fecha} {appointment.hora}</p>
                    <p><strong>Atendió:</strong> {user?.name}</p>
                </div>

                <hr />

                <h3 className="section-title">🛒 Productos adicionales</h3>
                {products.length === 0 ? (
                    <p className="no-products">No hay productos disponibles</p>
                ) : (
                    <div className="products-grid">
                        {products.map((prod) => (
                            <div key={prod.id} className="product-card">
                                <div className="product-info">
                                    <span>{prod.nombre}</span>
                                    <span className="price">${prod.precio_unitario}</span>
                                    <small>Stock: {prod.cantidad}</small>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    max={prod.cantidad}
                                    value={
                                        selectedProducts.find((p) => p.id === prod.id)?.cantidad || 0
                                    }
                                    onChange={(e) =>
                                        handleQuantityChange(prod, parseInt(e.target.value) || 0)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="payment-form">
                    <label>Método de pago:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                    </select>
                </div>

                <div className="payment-summary">
                    <p><strong>Servicio:</strong> ${totalServicio.toFixed(2)}</p>
                    <p><strong>Productos:</strong> ${totalProductos.toFixed(2)}</p>
                    <hr />
                    <p className="total"><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
                </div>

                <div className="modal-actions">
                    <button className="btn-pay" onClick={handlePay}>✅ Pagar</button>
                    <button className="btn-cancel" onClick={onClose}>❌ Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
