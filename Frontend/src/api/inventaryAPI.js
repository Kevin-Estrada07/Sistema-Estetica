import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const inventaryAPI = {
    getAll: () => api.get("/inventario", getAuthHeaders()),
    getOne: (id) => api.get(`/inventario/${id}`, getAuthHeaders()),
    create: (data) => api.post("/inventario", data, getAuthHeaders()),
    update: (id, data) => api.put(`/inventario/${id}`, data, getAuthHeaders()),
    delete: (id) => api.delete(`/inventario/${id}`, getAuthHeaders()),
    bajoStock: (umbral = 10) => api.get(`/inventario-bajo-stock?umbral=${umbral}`, getAuthHeaders())
};
