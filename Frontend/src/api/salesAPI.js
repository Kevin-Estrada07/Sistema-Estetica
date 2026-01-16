import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const salesAPI = {
    getAll: () => api.get("/ventas", getAuthHeaders()),
    // getOne: (id) => api.get(`/products/${id}`, getAuthHeaders()),
    create: (data) => api.post("/ventas", data, getAuthHeaders()),
    // update: (id, data) => api.put(`/products/${id}`, data, getAuthHeaders()),
    // delete: (id) => api.delete(`/products/${id}`, getAuthHeaders())
};
