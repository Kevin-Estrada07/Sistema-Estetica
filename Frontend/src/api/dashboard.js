import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 5000
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
};


