// ReportePage.jsx
import React, { useState, useEffect } from "react";
import "../styles/ReportePage.css";
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

export default function ReportPage() {
    const [inicio, setInicio] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [fin, setFin] = useState(() => new Date().toISOString().slice(0, 10));
    const [servicioFilter, setServicioFilter] = useState("todos");
    const [empleadoFilter, setEmpleadoFilter] = useState("todos");
    const [data, setData] = useState({
        ingresos: 0,
        totalCitas: 0,
        canceladas: 0,
        ticketPromedio: 0,
        ingresosPorDia: [],
        citasPorDia: [],
        ingresosPorServicio: [],
        DetalleCitas: [],
    });


    const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f97316", "#ef4444", "#a78bfa"];

    useEffect(() => {
        fetchReporte();
    }, [inicio, fin, servicioFilter, empleadoFilter]);

    async function fetchReporte() {
        try {
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
                ingresos: x.total
            }));

            const totalIngresos = ingresosPorDia.reduce(
                (acc, x) => acc + parseFloat(x.ingresos),
                0
            );

            // ---- Citas por día ----
            const citasPorDia = CitasDay.data.citasPorDia.map(x => ({
                dia: x.dia,
                total: parseInt(x.total, 10) // asegurar número entero
            }));

            // ---- Ingresos por servicio ----
            const ingresosPorServicio = ingresosServicioRes.data.ingresosPorServicio.map(x => ({
                nombre: x.nombre,
                total: parseFloat(x.total)
            }));


            setData(prev => ({
                ...prev,
                ingresos: ingresosPorDia.reduce((acc, x) => acc + x.ingresos, 0),
                totalCitas: citasRes.data.totalCompletadas,
                canceladas: canceladasRes.data.totalCanceladas,
                ingresosPorDia,
                citasPorDia,
                totalIngresos,
                ingresosPorServicio,
                DetalleCitas: DetalleCitasRes.data.ultimasCitas,
            }));
        } catch (e) {
            console.error(e);
        }
    }

    function exportCSV() {
        const rows = [
            ["ID", "Cliente", "Servicio", "Empleado", "Fecha", "Estado", "Precio"],
            ...data.DetalleCitas.map((c) => [c.id, c.cliente, c.servicio, c.empleado, c.fecha, c.estado, c.precio]),
        ];
        const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_citas_${inicio}_a_${fin}.csv`;
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
                <header className="reporte-header">
                    <div>
                        <h1 className="reporte-title">Reportes — Ingresos y Citas</h1>
                        <p className="reporte-range">Rango: {inicio} — {fin}</p>
                    </div>
                    <div className="reporte-actions">
                        <button onClick={exportCSV} className="btn btn-green">
                            <Download size={16} /> Exportar CSV
                        </button>
                        <button onClick={imprimir} className="btn btn-blue">
                            <Printer size={16} /> Imprimir
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

                    <select className="filtro-item" value={servicioFilter} onChange={(e) => setServicioFilter(e.target.value)}>
                        <option value="todos">Todos los servicios</option>
                        <option value="corte">Corte</option>
                        <option value="peinado">Peinado</option>
                    </select>

                    <select className="filtro-item" value={empleadoFilter} onChange={(e) => setEmpleadoFilter(e.target.value)}>
                        <option value="todos">Todos los empleados</option>
                        <option value="luis">Luis</option>
                        <option value="sofia">Sofía</option>
                    </select>

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

                <section className="reporte-charts">
                    <div className="chart">
                        <h3>Ingresos por día</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.ingresosPorDia}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="ingresos" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart">
                        <h3>Citas por día</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.citasPorDia}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart full">
                        <h3>Ingresos por servicio</h3>
                        <ResponsiveContainer>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}