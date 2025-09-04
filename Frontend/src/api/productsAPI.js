import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 5000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const productsAPI = {
    getAll: () => api.get("/products", getAuthHeaders()),
    getOne: (id) => api.get(`/products/${id}`, getAuthHeaders()),
    create: (data) => api.post("/products", data, getAuthHeaders()),
    update: (id, data) => api.put(`/products/${id}`, data, getAuthHeaders()),
    delete: (id) => api.delete(`/products/${id}`, getAuthHeaders())
};
