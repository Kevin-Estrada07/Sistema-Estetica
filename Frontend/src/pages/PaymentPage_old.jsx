import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../api/appointmentsAPI";
import { productsAPI } from "../api/productsAPI";
import "../styles/PaymentPage.css";
import Sidebar from "../components/Sidebar";
import { salesAPI } from "../api/salesAPI";
import { generatePDF } from "../components/generatePDF"; // ruta según tu proyecto

// import autoTable from "jspdf-autotable";
// import jsPDF from "jspdf";

const PaymentPage = () => {
    const { user } = useAuth();
    const { id } = useParams(); // id de la cita desde la URL
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [products, setProducts] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("efectivo");
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: dataAppt } = await appointmentsAPI.getOne(id);
                setAppointment(dataAppt);

                const { data: dataProducts } = await productsAPI.getAll();
                setProducts(dataProducts);
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, [id]);

    if (!appointment) return <p>Cargando cita...</p>;

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

    //     const doc = new jsPDF();

    //     doc.text("Ticket de Venta", 14, 15);
    //     doc.text(`Cliente: ${venta.cliente?.nombre}`, 14, 25);
    //     doc.text(`Usuario: ${venta.usuario?.name}`, 14, 32);
    //     doc.text(`Método de pago: ${venta.metodo_pago}`, 14, 39);
    //     doc.text(`Fecha: ${venta.fecha}`, 14, 46);

    //     const rows = venta.detalles.map((d) => [
    //         d.nombre || d.servicio?.nombre,
    //         d.cantidad,
    //         `$${d.precio_unitario}`,
    //         `$${d.subtotal}`
    //     ]);

    //     autoTable(doc, {
    //         head: [["Concepto", "Cantidad", "Precio", "Subtotal"]],
    //         body: rows,
    //         startY: 55,
    //     });

    //     // Ojo: ahora el último Y se obtiene de esta forma
    //     const finalY = doc.lastAutoTable?.finalY || 55;
    //     doc.text(`TOTAL: $${venta.total}`, 14, finalY + 10);

    //     doc.save("ticket.pdf");
    // };

    const handlePay = async () => {
        try {
            const detalles = [
                {
                    servicio_id: appointment.servicio?.id,
                    producto_id: null,
                    cantidad: 1,
                    precio_unitario: appointment.servicio?.precio,
                    subtotal: appointment.servicio?.precio,
                },
                ...selectedProducts
                    .filter((p) => p.cantidad > 0)
                    .map((p) => ({
                        servicio_id: null,
                        producto_id: p.id,
                        cantidad: p.cantidad,
                        precio_unitario: p.precio_unitario,
                        subtotal: p.precio_unitario * p.cantidad,
                    })),
            ];

            // 👇 Aquí recibes toda la respuesta de axios
            const { data } = await salesAPI.create({
                cliente_id: appointment.cliente?.id,
                usuario_id: user?.id,
                total,
                metodo_pago: paymentMethod,
                detalles,
            });

            // ✅ Extraer la venta
            const venta = data.venta;

            await appointmentsAPI.updateEstado(appointment.id, { estado: "completada" });

            generatePDF({
                cliente: venta.cliente,
                usuario: venta.usuario,
                metodo_pago: venta.metodo_pago,
                fecha: venta.fecha,
                total: venta.total,
                detalles: venta.detalles.map(d => ({
                    ...d,
                    nombre: d.producto?.nombre || d.servicio?.nombre
                })),
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

            {/* Contenido principal ocupa todo el espacio sobrante */}
            <div className="payment-page">
                <header className="payment-header">
                    <h2>💳 Pago de Servicio</h2>
                    <button className="btn-back" onClick={() => navigate("/citas")}>⬅ Volver</button>
                </header>

                <section className="appointment-info">
                    <p><strong>Cliente:</strong> {appointment.cliente?.nombre}</p>
                    <p><strong>Servicio:</strong> {appointment.servicio?.nombre} — ${appointment.servicio?.precio}</p>
                    <p><strong>Fecha:</strong> {appointment.fecha} {appointment.hora}</p>
                    <p><strong>Atendió:</strong> {user?.name}</p>
                </section>

                <section className="products-section">
                    <h3>🛒 Productos adicionales</h3>
                    {products.length === 0 ? (
                        <p>No hay productos disponibles</p>
                    ) : (
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
                                {products.map((prod) => {
                                    const cantidad = selectedProducts.find((p) => p.id === prod.id)?.cantidad || 0;
                                    return (
                                        <tr key={prod.id}>
                                            <td>{prod.nombre}</td>
                                            <td>${prod.precio_unitario}</td>
                                            <td>{prod.cantidad}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={prod.cantidad}
                                                    value={cantidad}
                                                    onChange={(e) =>
                                                        handleQuantityChange(prod, parseInt(e.target.value) || 0)
                                                    }
                                                />
                                            </td>
                                            <td>${(cantidad * prod.precio_unitario).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </section>

                <section className="payment-summary">
                    <div className="payment-method">
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
    );
};

export default PaymentPage;
