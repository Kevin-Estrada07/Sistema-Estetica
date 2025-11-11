import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 30000  // Aumentado a 30 segundos para reportes complejos
});

// Interceptor para añadir token automáticamente a cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const dashboard = {
    // Ingresos por día
    getIngresosPorDia: (inicio, fin) =>
        api.get("/dashboard/ingresos-por-dia", { params: { inicio, fin } }),

    // Ingresos por servicio
    getIngresosPorServicio: (inicio, fin) =>
        api.get("/dashboard/ingresos-por-servicio", { params: { inicio, fin } }),

    // citas por día
    getCitasPorDia: (inicio, fin) =>
        api.get("/dashboard/citas-por-dia", { params: { inicio, fin } }),

    // Total de citas completadas
    getCitasCompletadas: (inicio, fin) =>
        api.get("/dashboard/citas-completadas", { params: { inicio, fin } }),

    // Total de citas completadas
    getCitasCanceladas: (inicio, fin) =>
        api.get("/dashboard/citas-canceladas", { params: { inicio, fin } }),

    // Detalle de las citas
    getDetalleCitas: (inicio, fin) =>
        api.get("/dashboard/detalle-citas-dia", { params: { inicio, fin } }),

    // Top servicios
    getTopServicios: (inicio, fin, limit = 10) =>
        api.get("/dashboard/top-servicios", { params: { inicio, fin, limit } }),

    // Top estilistas
    getTopEstilistas: (inicio, fin, limit = 10) =>
        api.get("/dashboard/top-estilistas", { params: { inicio, fin, limit } }),

    // Ranking servicios
    getRankingServicios: (inicio, fin) =>
        api.get("/dashboard/ranking-servicios", { params: { inicio, fin } }),

    // Productos con rotación
    getProductosRotacion: () =>
        api.get("/dashboard/productos-rotacion"),

    // Productos bajo stock
    getProductosBajoStock: (umbral = 10) =>
        api.get("/dashboard/productos-bajo-stock", { params: { umbral } }),
};
