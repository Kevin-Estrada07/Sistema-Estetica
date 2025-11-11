import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const testimoniosAPI = {
    // Endpoints públicos
    getAprobados: () => api.get("/testimonios"),
    getDestacados: () => api.get("/testimonios/destacados"),
    create: (data) => api.post("/testimonios", data),

    // Endpoints protegidos (admin)
    getTodos: () => api.get("/testimonios/todos", getAuthHeaders()),
    aprobar: (id) => api.patch(`/testimonios/${id}/aprobar`, {}, getAuthHeaders()),
    destacar: (id) => api.patch(`/testimonios/${id}/destacar`, {}, getAuthHeaders()),
    delete: (id) => api.delete(`/testimonios/${id}`, getAuthHeaders()),
};

