import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 5000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const servicesAPI = {
    getAll: () => api.get("/services", getAuthHeaders()),
    getOne: (id) => api.get(`/services/${id}`, getAuthHeaders()),
    create: (data) => api.post("/services", data, getAuthHeaders()),
    update: (id, data) => api.put(`/services/${id}`, data, getAuthHeaders()),
    delete: (id) => api.delete(`/services/${id}`, getAuthHeaders())
};
