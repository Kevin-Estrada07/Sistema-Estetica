import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../api/appointmentsAPI";
import { productsAPI } from "../api/productsAPI";
import { servicesAPI } from "../api/serviciosAPI"; // si tienes API de servicios
import { clientsAPI } from "../api/clientesAPI";   // para seleccionar clientes
import { salesAPI } from "../api/salesAPI";
import Sidebar from "../components/Sidebar";
import generatePDF from "../components/generatePDF";
import "../styles/PaymentPage.css";


const SalePage = () => {
    const { user } = useAuth();
    const { appointmentId } = useParams(); // opcional
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(clients.find(c => c.nombre === "Invitado"));
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("efectivo");


    // Cargar datos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: dataProducts } = await productsAPI.getAll();
                setProducts(dataProducts);

                const { data: dataServices } = await servicesAPI.getAll();
                setServices(dataServices);

                const { data: dataClients } = await clientsAPI.getAll();
                setClients(dataClients);

                if (appointmentId) {
                    const { data: dataAppt } = await appointmentsAPI.getOne(appointmentId);
                    setAppointment(dataAppt);
                    setSelectedClient(dataAppt.cliente);
                    setSelectedService(dataAppt.servicio);
                }
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, [appointmentId]);

    if (appointmentId && !appointment) return <p>Cargando cita...</p>;

    // Función para manejar cantidades de productos
    const handleQuantityChange = (prod, cantidad) => {
        if (cantidad < 0) cantidad = 0;
        if (cantidad > prod.cantidad) cantidad = prod.cantidad;

        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === prod.id);
            if (exists) {
                return prev.map(p => p.id === prod.id ? { ...p, cantidad } : p);
            }
            return [...prev, { ...prod, cantidad }];
        });
    };

    // Totales
    const totalServicio = Number(selectedService?.precio || 0);
    const totalProductos = selectedProducts.reduce((acc, p) => acc + Number(p.precio_unitario) * p.cantidad, 0);
    const total = totalServicio + totalProductos;

    // Función para registrar venta
    const handlePay = async () => {
        if (!selectedClient) {
            return alert("⚠️ Selecciona un cliente");
        }

        // Validar que haya un servicio seleccionado o productos con cantidad
        const tieneServicio = !!selectedService;
        const tieneProductos = selectedProducts.some(p => p.cantidad > 0);

        if (!tieneServicio && !tieneProductos) {
            return alert("⚠️ Debes seleccionar al menos un servicio o producto para realizar la venta");
        }

        try {
            const detalles = [
                ...(tieneServicio
                    ? [{
                        servicio_id: selectedService.id,
                        producto_id: null,
                        cantidad: 1,
                        precio_unitario: selectedService.precio,
                        subtotal: selectedService.precio
                    }]
                    : []),
                ...selectedProducts
                    .filter(p => p.cantidad > 0)
                    .map(p => ({
                        servicio_id: null,
                        producto_id: p.id,
                        cantidad: p.cantidad,
                        precio_unitario: p.precio_unitario,
                        subtotal: p.precio_unitario * p.cantidad
                    }))
            ];

            const { data } = await salesAPI.create({
                cliente_id: selectedClient.id,
                usuario_id: user.id,
                total,
                metodo_pago: paymentMethod,
                detalles
            });

            const venta = data.venta;

            if (appointmentId) {
                await appointmentsAPI.updateEstado(appointmentId, { estado: "completada" });
            }

            generatePDF({
                id: venta.id,
                cita_id: appointmentId,
                cliente: venta.cliente,
                usuario: venta.usuario,
                metodo_pago: venta.metodo_pago,
                fecha: venta.fecha,
                total: venta.total,
                detalles: venta.detalles.map(d => ({
                    ...d,
                    nombre: d.producto?.nombre || d.servicio?.nombre 
                }))
            });

            alert("✅ Venta registrada correctamente");
            navigate("/citas");
        } catch (err) {
            console.error("Error registrando venta:", err);
            alert("❌ Error al registrar la venta");
        }
    };


    return (
        <div className="dashboard">
            <Sidebar />
            <div className="payment-page">
                <header className="payment-header">
                    <h2>💳 Nueva Venta {appointmentId ? "(Desde cita)" : ""}</h2>
                    <button className="btn-back" onClick={() => navigate("/citas")}>⬅ Volver</button>
                </header>

                <div className="form-grid">
                    <section className="client-section">
                        <label>Cliente:</label>
                        {appointmentId ? (
                            <p>{selectedClient?.nombre}</p>
                        ) : (
                            <select
                                value={selectedClient?.id || "invitado"}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === "invitado") {
                                        setSelectedClient({ id: 2, nombre: "Invitado" });
                                    } else {
                                        setSelectedClient(clients.find(c => c.id === parseInt(value)));
                                    }
                                }}>
                                <option value="2">Invitado</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </section>

                    <section className="service-section">
                        <label>Servicio:</label>
                        {appointmentId ? (
                            <p>
                                {selectedService?.nombre} — ${selectedService?.precio}
                            </p>
                        ) : (
                            <select
                                value={selectedService?.id || ""}
                                onChange={e =>
                                    setSelectedService(
                                        services.find(s => s.id === parseInt(e.target.value))
                                    )
                                }>
                                <option value="">Selecciona un servicio</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre} — ${s.precio}
                                    </option>
                                ))}
                            </select>
                        )}
                    </section>
                </div>

                <section className="products-section">
                    <h3>Productos</h3>
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(prod => {
                                const cantidad = selectedProducts.find(p => p.id === prod.id)?.cantidad || 0;
                                return (
                                    <tr key={prod.id}>
                                        <td>{prod.nombre}</td>
                                        <td>${prod.precio_unitario}</td>
                                        <td>{prod.cantidad}</td>
                                        <td>
                                            <input type="number" min="0" max={prod.cantidad} value={cantidad}
                                                onChange={e => handleQuantityChange(prod, parseInt(e.target.value) || 0)} />
                                        </td>
                                        <td>${(cantidad * prod.precio_unitario).toFixed(2)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </section>

                <section className="payment-summary">
                    <div className="payment-method">
                        <label>Método de pago:</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div className="summary-box">
                        <p><strong>Servicio:</strong> ${totalServicio.toFixed(2)}</p>
                        <p><strong>Productos:</strong> ${totalProductos.toFixed(2)}</p>
                        <hr />
                        <p className="total"><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
                    </div>
                    <div className="actions">
                        <button className="btn-pay" onClick={handlePay}>✅ Pagar</button>
                        <button className="btn-cancel" onClick={() => navigate("/citas")}>❌ Cancelar</button>
                    </div>
                </section>
            </div>
        </div>
    )
};

export default SalePage;
