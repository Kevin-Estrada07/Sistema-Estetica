import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// Todos los endpoints usan el token de auth
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
});

export const appointmentsAPI = {
  // Obtener todas las citas con paginación
  getAll: (page = 1) => api.get(`/citas?page=${page}`, getAuthHeaders()),

  // Obtener una cita específica
  getOne: (id) => api.get(`/citas/${id}`, getAuthHeaders()),

  // Crear nueva cita
  create: (data) => api.post("/citas", data, getAuthHeaders()),

  // Actualizar cita completa
  update: (id, data) => api.put(`/citas/${id}`, data, getAuthHeaders()),

  // Actualizar solo el estado de la cita
  updateEstado: (id, data) => api.put(`/citas/${id}/estado`, data, getAuthHeaders()),

  // DEPRECATED: Usar getAll() en su lugar
  // Mantener por compatibilidad hacia atrás
  getInfo: (page = 1) => api.get(`/info?page=${page}`, getAuthHeaders()),

  // Eliminar cita
  delete: (id) => api.delete(`/citas/${id}`, getAuthHeaders())
};
