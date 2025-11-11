import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../api/appointmentsAPI";
import { inventaryAPI } from "../api/InventaryAPI";
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

    // Estados para búsqueda de productos
    const [searchProduct, setSearchProduct] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Estados para impuestos y descuentos
    const [discountType, setDiscountType] = useState("percentage"); // "percentage" o "fixed"
    const [discountValue, setDiscountValue] = useState(0);
    const [taxPercentage, setTaxPercentage] = useState(0);


    // Cargar datos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: dataProducts } = await inventaryAPI.getAll();
                // Filtrar solo productos de tipo 'venta' o 'ambos'
                const productosParaVenta = dataProducts.filter(
                    p => p.tipo === 'venta' || p.tipo === 'ambos'
                );
                setProducts(productosParaVenta);

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

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (searchProduct.trim() === "") {
            setFilteredProducts([]);
        } else {
            const lower = searchProduct.toLowerCase();
            const filtered = products.filter(p =>
                p.nombre.toLowerCase().includes(lower) ||
                p.id.toString().includes(lower)
            );
            setFilteredProducts(filtered);
        }
    }, [searchProduct, products]);

    if (appointmentId && !appointment) return <p>Cargando cita...</p>;

    // Función para agregar producto a la venta
    const handleAddProduct = (prod) => {
        const exists = selectedProducts.find(p => p.id === prod.id);
        if (exists) {
            // Si ya existe, incrementar cantidad
            handleQuantityChange(prod, exists.cantidad + 1);
        } else {
            // Si no existe, agregar con cantidad 1
            setSelectedProducts(prev => [...prev, { ...prod, cantidad: 1 }]);
        }
        // Limpiar búsqueda
        setSearchProduct("");
    };

    // Función para manejar cantidades de productos
    const handleQuantityChange = (prod, cantidad) => {
        if (cantidad < 0) cantidad = 0;
        if (cantidad > prod.stock) cantidad = prod.stock;

        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === prod.id);
            if (exists) {
                if (cantidad === 0) {
                    // Si la cantidad es 0, eliminar el producto
                    return prev.filter(p => p.id !== prod.id);
                }
                return prev.map(p => p.id === prod.id ? { ...p, cantidad } : p);
            }
            return [...prev, { ...prod, cantidad }];
        });
    };

    // Función para eliminar producto de la venta
    const handleRemoveProduct = (prodId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== prodId));
    };

    // Cálculos de totales
    const totalServicio = Number(selectedService?.precio || 0);
    const totalProductos = selectedProducts.reduce((acc, p) => acc + Number(p.precio) * p.cantidad, 0);
    const subtotal = totalServicio + totalProductos;

    // Calcular descuento
    const discountAmount = discountType === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue;

    const subtotalAfterDiscount = subtotal - discountAmount;

    // Calcular impuesto
    const taxAmount = (subtotalAfterDiscount * taxPercentage) / 100;

    // Total final
    const total = subtotalAfterDiscount + taxAmount;

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
                        precio_unitario: p.precio,
                        subtotal: p.precio * p.cantidad
                    }))
            ];

            const { data } = await salesAPI.create({
                cliente_id: selectedClient.id,
                usuario_id: user.id,
                subtotal,
                descuento_porcentaje: discountType === "percentage" ? discountValue : 0,
                descuento_monto: discountAmount,
                impuesto_porcentaje: taxPercentage,
                impuesto_monto: taxAmount,
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
                subtotal: venta.subtotal,
                descuento_porcentaje: venta.descuento_porcentaje,
                descuento_monto: venta.descuento_monto,
                impuesto_porcentaje: venta.impuesto_porcentaje,
                impuesto_monto: venta.impuesto_monto,
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
                                {services
                                    .filter(s => s.activo === true || s.activo === 1)
                                    .map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.nombre} — ${s.precio}
                                        </option>
                                    ))}
                            </select>
                        )}
                    </section>
                </div>

                <section className="products-section">
                    <div className="products-header">
                        <h3>🛒 Productos</h3>
                        <div className="search-product-container">
                            <input
                                type="text"
                                className="search-product-input"
                                placeholder="🔍 Buscar producto por nombre o ID..."
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                            />
                            {searchProduct && filteredProducts.length > 0 && (
                                <div className="search-results">
                                    {filteredProducts.map(prod => (
                                        <div
                                            key={prod.id}
                                            className="search-result-item"
                                            onClick={() => handleAddProduct(prod)}>
                                            <div className="result-info">
                                                <span className="result-name">{prod.nombre}</span>
                                                <span className="result-details">
                                                    ${parseFloat(prod.precio).toFixed(2)} | Stock: {prod.stock}
                                                </span>
                                            </div>
                                            <button className="btn-add-product">➕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchProduct && filteredProducts.length === 0 && (
                                <div className="search-results">
                                    <div className="no-results">
                                        No se encontraron productos
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedProducts.length > 0 ? (
                        <div className="table-responsive">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Cantidad</th>
                                        <th>Subtotal</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map(prod => (
                                        <tr key={prod.id}>
                                            <td data-label="Producto">{prod.nombre}</td>
                                            <td data-label="Precio">${parseFloat(prod.precio).toFixed(2)}</td>
                                            <td data-label="Stock">{prod.stock}</td>
                                            <td data-label="Cantidad">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={prod.stock}
                                                    value={prod.cantidad}
                                                    onChange={e => handleQuantityChange(prod, parseInt(e.target.value) || 0)}
                                                    className="quantity-input"
                                                />
                                            </td>
                                            <td data-label="Subtotal" className="subtotal">${(prod.cantidad * parseFloat(prod.precio)).toFixed(2)}</td>
                                            <td data-label="Acciones">
                                                <button
                                                    className="btn-remove-product"
                                                    onClick={() => handleRemoveProduct(prod.id)}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-products-selected">
                            <p>🔍 Busca y agrega productos a la venta</p>
                        </div>
                    )}
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

                    {/* Descuento */}
                    <div className="discount-section">
                        <label>💰 Descuento:</label>
                        <div className="discount-controls">
                            <select
                                value={discountType}
                                onChange={e => setDiscountType(e.target.value)}
                                className="discount-type">
                                <option value="percentage">Porcentaje (%)</option>
                                <option value="fixed">Monto Fijo ($)</option>
                            </select>
                            <input
                                type="number"
                                min="0"
                                max={discountType === "percentage" ? 100 : subtotal}
                                step="0.01"
                                value={discountValue}
                                onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                                className="discount-input"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Impuesto */}
                    <div className="tax-section">
                        <label>📊 Impuesto (%):</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={taxPercentage}
                            onChange={e => setTaxPercentage(parseFloat(e.target.value) || 0)}
                            className="tax-input"
                            placeholder="0"
                        />
                    </div>

                    <div className="summary-box">
                        <p><strong>Servicio:</strong> ${totalServicio.toFixed(2)}</p>
                        <p><strong>Productos:</strong> ${totalProductos.toFixed(2)}</p>
                        <hr />
                        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        {discountAmount > 0 && (
                            <p className="discount-line">
                                <strong>Descuento:</strong>
                                <span className="discount-amount">-${discountAmount.toFixed(2)}</span>
                            </p>
                        )}
                        {taxAmount > 0 && (
                            <p className="tax-line">
                                <strong>Impuesto ({taxPercentage}%):</strong>
                                <span className="tax-amount">+${taxAmount.toFixed(2)}</span>
                            </p>
                        )}
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
