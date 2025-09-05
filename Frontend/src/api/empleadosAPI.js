import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 5000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const empleadosAPI = {
    getAll: () => api.get("/empleados", getAuthHeaders()),
};
