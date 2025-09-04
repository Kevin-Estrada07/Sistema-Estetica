import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 5000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const clientsAPI = {
  getAll: () => api.get("/clients", getAuthHeaders()),
  getOne: (id) => api.get(`/clients/${id}`, getAuthHeaders()),
  create: (data) => api.post("/clients", data, getAuthHeaders()),
  update: (id, data) => api.put(`/clients/${id}`, data, getAuthHeaders()),
  delete: (id) => api.delete(`/clients/${id}`, getAuthHeaders())
};
