import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 15000
});

// Interceptor para añadir token automáticamente a cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const adminAPI = {
    getAllUsers: () => api.get("/users"),
    registerUser: (data) => api.post("/admin/register", data),
    logout: () => api.post("/logout"),
    deleteUser: (id) => {
        return api.delete(`/users/${id}`);
    },
    getDashboardStats: () => api.get("/dashboard/stats"),
};

