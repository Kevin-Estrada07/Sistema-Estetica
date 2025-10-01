import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const appointmentsAPI = {
  getAll: () => api.get("/citas", getAuthHeaders()),
  getOne: (id) => api.get(`/citas/${id}`, getAuthHeaders()),
  create: (data) => api.post("/citas", data, getAuthHeaders()),
  update: (id, data) => api.put(`/citas/${id}`, data, getAuthHeaders()),
  updateEstado: (id, data) => api.put(`/citas/${id}/estado`, data, getAuthHeaders()),
  getInfo: () => api.get("/info", getAuthHeaders()),
  delete: (id) => api.delete(`/citas/${id}`, getAuthHeaders())
};
