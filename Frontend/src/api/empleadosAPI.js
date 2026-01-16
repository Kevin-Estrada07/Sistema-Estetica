import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const empleadosAPI = {
    getAll: () => api.get("/empleados", getAuthHeaders()),
};
