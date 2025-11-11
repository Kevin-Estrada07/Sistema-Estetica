// ReportePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { dashboard } from "../api/dashboard";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Download, Calendar, Printer } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/ReportePage.css";
import { ReportPDF } from "../components/ReportPDF";


export default function ReportPage() {
    const [inicio, setInicio] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [fin, setFin] = useState(() => new Date().toISOString().slice(0, 10));
    const [servicioFilter, setServicioFilter] = useState("todos");
    const [empleadoFilter, setEmpleadoFilter] = useState("todos");
    const [umbralStock, setUmbralStock] = useState(10);
    const [umbralStockInput, setUmbralStockInput] = useState(10); // Input temporal
    const [loading, setLoading] = useState(true);
    const [loadingStock, setLoadingStock] = useState(false);
    const [data, setData] = useState({
        ingresos: 0,
        totalCitas: 0,
        canceladas: 0,
        ticketPromedio: 0,
        ingresosPorDia: [],
        citasPorDia: [],
        ingresosPorServicio: [],
        DetalleCitas: [],
        topServicios: [],
        topEstilistas: [],
        rankingConteo: [],
        rankingMonto: [],
        productosRotacion: [],
        productosBajoStock: [],
    });


    const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f97316", "#ef4444", "#a78bfa"];

    useEffect(() => {
        fetchReporte();
    }, [inicio, fin, servicioFilter, empleadoFilter]);

    // Efecto separado solo para productos bajo stock
    useEffect(() => {
        fetchProductosBajoStock();
    }, [umbralStock]);

    // Debouncing para el input de umbral (espera 500ms después de que el usuario deje de escribir)
    useEffect(() => {
        const timer = setTimeout(() => {
            setUmbralStock(umbralStockInput);
        }, 500);

        return () => clearTimeout(timer);
    }, [umbralStockInput]);

    // Función separada para cargar solo productos bajo stock
    async function fetchProductosBajoStock() {
        setLoadingStock(true);
        try {
            const bajoStockRes = await dashboard.getProductosBajoStock(umbralStock);
            setData(prev => ({
                ...prev,
                productosBajoStock: bajoStockRes.data.productosBajoStock || [],
            }));
        } catch (e) {
            console.error("Error al cargar productos bajo stock:", e);
        } finally {
            setLoadingStock(false);
        }
    }

    async function fetchReporte() {
        setLoading(true);
        try {
            // GRUPO 1: Datos críticos (se muestran primero)
            const [ingresosRes, CitasDay, citasRes, canceladasRes, ingresosServicioRes, DetalleCitasRes] = await Promise.all([
                dashboard.getIngresosPorDia(inicio, fin),
                dashboard.getCitasPorDia(inicio, fin),
                dashboard.getCitasCompletadas(inicio, fin),
                dashboard.getCitasCanceladas(inicio, fin),
                dashboard.getIngresosPorServicio(inicio, fin),
                dashboard.getDetalleCitas(inicio, fin),
            ]);

            // ---- Ingresos por día ----
            const ingresosPorDia = ingresosRes.data.ingresosPorDia.map(x => ({
                dia: x.dia,
                ingresos: parseFloat(x.total)
            }));

            const totalIngresos = ingresosPorDia.reduce((acc, x) => acc + x.ingresos, 0);

            // ---- Citas por día ----
            const citasPorDia = CitasDay.data.citasPorDia.map(x => ({
                dia: x.dia,
                total: parseInt(x.total, 10)
            }));

            // ---- Ingresos por servicio ----
            const ingresosPorServicio = ingresosServicioRes.data.ingresosPorServicio.map(x => ({
                nombre: x.nombre,
                total: parseFloat(x.total)
            }));

            // Actualizar datos principales INMEDIATAMENTE
            setData(prev => ({
                ...prev,
                ingresos: totalIngresos,
                totalCitas: citasRes.data.totalCompletadas,
                canceladas: canceladasRes.data.totalCanceladas,
                ingresosPorDia,
                citasPorDia,
                totalIngresos,
                ingresosPorServicio,
                DetalleCitas: DetalleCitasRes.data.ultimasCitas,
            }));

            // Marcar como cargado después de los datos principales
            setLoading(false);

            // GRUPO 2: Datos secundarios (se cargan en segundo plano)
            // No bloqueamos la UI esperando estos datos
            Promise.all([
                dashboard.getTopServicios(inicio, fin, 10),
                dashboard.getTopEstilistas(inicio, fin, 10),
                dashboard.getRankingServicios(inicio, fin),
                dashboard.getProductosRotacion(),
            ]).then(([topServiciosRes, topEstilistasRes, rankingRes, rotacionRes]) => {
                setData(prev => ({
                    ...prev,
                    topServicios: topServiciosRes.data.topServicios || [],
                    topEstilistas: topEstilistasRes.data.topEstilistas || [],
                    rankingConteo: rankingRes.data.rankingConteo || [],
                    rankingMonto: rankingRes.data.rankingMonto || [],
                    productosRotacion: rotacionRes.data.productosRotacion || [],
                }));
            }).catch(e => {
                console.error("Error al cargar reportes secundarios:", e);
            });

        } catch (e) {
            console.error("Error al cargar reportes:", e);
            alert("Error al cargar los reportes. Intenta nuevamente.");
            setLoading(false);
        }
    }

    function exportCSV() {
        let csv = "";

        // Resumen
        csv += "RESUMEN DE REPORTES\n";
        csv += `Período: ${inicio} a ${fin}\n\n`;
        csv += `Ingresos Totales,${data.totalIngresos}\n`;
        csv += `Total Citas,${data.totalCitas}\n`;
        csv += `Citas Canceladas,${data.canceladas}\n\n`;

        // Top Servicios
        csv += "TOP SERVICIOS\n";
        csv += "Nombre,Total Citas,Monto Total\n";
        data.topServicios.forEach(s => {
            csv += `"${s.nombre}",${s.total_citas},${parseFloat(s.monto_total).toFixed(2)}\n`;
        });
        csv += "\n";

        // Top Estilistas
        csv += "TOP ESTILISTAS\n";
        csv += "Nombre,Total Citas,Monto Total\n";
        data.topEstilistas.forEach(e => {
            csv += `"${e.name}",${e.total_citas},${parseFloat(e.monto_total).toFixed(2)}\n`;
        });
        csv += "\n";

        // Productos Bajo Stock
        csv += "PRODUCTOS BAJO STOCK\n";
        csv += "Nombre,Stock,Precio,Valor Total\n";
        data.productosBajoStock.forEach(p => {
            csv += `"${p.nombre}",${p.stock},${parseFloat(p.precio).toFixed(2)},${parseFloat(p.valor_total).toFixed(2)}\n`;
        });
        csv += "\n";

        // Productos con Rotación
        csv += "PRODUCTOS CON ROTACIÓN\n";
        csv += "Nombre,Stock,Cantidad Usada,Servicios Asociados\n";
        data.productosRotacion.forEach(p => {
            csv += `"${p.nombre}",${p.stock},${p.cantidad_usada},${p.servicios_asociados}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_completo_${inicio}_a_${fin}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function imprimir() {
        window.print();
    }

    return (
        <div className="report-page">
            <Sidebar />

            <main className="report-content">
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner-large"></div>
                        <p>Cargando reportes...</p>
                    </div>
                )}

                <header className="reporte-header">
                    <div>
                        <h1 className="reporte-title">Reportes — Ingresos y Citas</h1>
                        <p className="reporte-range">Rango: {inicio} — {fin}</p>
                    </div>
                    <div className="reporte-actions">
                        <button onClick={exportCSV} className="btn btn-green" disabled={loading}>
                            <Download size={16} /> Exportar CSV
                        </button>
                        {/* <button onClick={imprimir} className="btn btn-blue">
                            <Printer size={16} /> Imprimir
                        </button> */}
                        <button onClick={() => ReportPDF(data, { inicio, fin })} className="btn btn-blue" disabled={loading}>
                            <Download size={16} /> Exportar PDF
                        </button>
                    </div>
                </header>

                <section className="reporte-filtros">
                    <label className="filtro-item">
                        <Calendar size={18} />
                        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                    </label>
                    <label className="filtro-item">
                        <Calendar size={18} />
                        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
                    </label>

                    <button onClick={fetchReporte} className="btn btn-indigo">Actualizar</button>
                </section>

                <section className="reporte-cards">
                    <div className="card">
                        <p className="card-label">Ingresos</p>
                        <p className="card-value">${data.totalIngresos}</p>
                    </div>
                    <div className="card">
                        <p className="card-label">Total citas</p>
                        <p className="card-value">{data.totalCitas}</p>
                    </div>
                    <div className="card">
                        <p className="card-label">Canceladas</p>
                        <p className="card-value">{data.canceladas}</p>
                    </div>

                </section>

                <section id="chart-ingresos" className="reporte-charts">
                    <div className="chart">
                        <h3>Ingresos por día</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={data.ingresosPorDia}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="ingresos" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div id="chart-citas" className="chart">
                        <h3>Citas por día</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.citasPorDia}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div id="chart-servicios" className="chart">
                        <h3>Ingresos por servicio</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={data.ingresosPorServicio} dataKey="total" nameKey="nombre" innerRadius={60} outerRadius={100} label>
                                    {data.ingresosPorServicio.map((entry, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="reporte-tabla">
                    <h3>Últimas citas</h3>
                    <div className="tabla-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>Servicio</th>
                                    <th>Empleado</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.DetalleCitas?.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.clientes}</td>
                                        <td>{c.servicios}</td>
                                        <td>{c.users}</td>
                                        <td>{c.fecha}</td>
                                        <td>{c.estado}</td>
                                        <td>{c.servicio_precio}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* TOP SERVICIOS Y ESTILISTAS */}
                <section className="reporte-ranking">
                    <div className="ranking-container">
                        <div className="ranking-card">
                            <h3>🏆 Top Servicios</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Servicio</th>
                                        <th>Citas</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topServicios?.map((s, idx) => (
                                        <tr key={idx}>
                                            <td>{s.nombre}</td>
                                            <td className="text-center">{s.total_citas}</td>
                                            <td className="text-right">${parseFloat(s.monto_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="ranking-card">
                            <h3>⭐ Top Estilistas</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Estilista</th>
                                        <th>Citas</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topEstilistas?.map((e, idx) => (
                                        <tr key={idx}>
                                            <td>{e.name}</td>
                                            <td className="text-center">{e.total_citas}</td>
                                            <td className="text-right">${parseFloat(e.monto_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* INVENTARIO */}
                <section className="reporte-inventario">
                    <div className="inventario-container">
                        <div className="inventario-card">
                            <h3>📦 Productos con Rotación</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Stock</th>
                                        <th>Cantidad Usada</th>
                                        <th>Servicios</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.productosRotacion?.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{p.nombre}</td>
                                            <td className="text-center">{p.stock}</td>
                                            <td className="text-center">{p.cantidad_usada}</td>
                                            <td className="text-center">{p.servicios_asociados}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="inventario-card">
                            <div className="bajo-stock-header">
                                <h3>⚠️ Productos Bajo Stock</h3>
                                <input
                                    type="number"
                                    value={umbralStockInput}
                                    onChange={(e) => setUmbralStockInput(parseInt(e.target.value) || 10)}
                                    placeholder="Umbral"
                                    className="umbral-input"
                                    min="1"
                                />
                            </div>
                            {loadingStock ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <div className="spinner"></div>
                                    <p style={{ marginTop: '10px', color: '#666' }}>Cargando productos...</p>
                                </div>
                            ) : data.productosBajoStock && data.productosBajoStock.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Stock</th>
                                            <th>Precio</th>
                                            <th>Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.productosBajoStock.map((p, idx) => (
                                            <tr key={idx} className="bajo-stock-row">
                                                <td>{p.nombre}</td>
                                                <td className="text-center stock-warning">{p.stock}</td>
                                                <td className="text-right">${parseFloat(p.precio).toFixed(2)}</td>
                                                <td className="text-right">${parseFloat(p.valor_total).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    ✅ No hay productos con stock menor o igual a {umbralStock}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}