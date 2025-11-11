import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

const reembolsosAPI = {
    // Obtener todos los reembolsos
    getAll: () => api.get('/reembolsos', getAuthHeaders()),

    // Obtener un reembolso específico
    getById: (id) => api.get(`/reembolsos/${id}`, getAuthHeaders()),

    // Crear solicitud de reembolso
    create: (data) => api.post('/reembolsos', data, getAuthHeaders()),

    // Aprobar o rechazar reembolso (admin)
    updateEstado: (id, data) => api.patch(`/reembolsos/${id}/estado`, data, getAuthHeaders()),

    // Eliminar solicitud de reembolso
    delete: (id) => api.delete(`/reembolsos/${id}`, getAuthHeaders()),
};

export default reembolsosAPI;

