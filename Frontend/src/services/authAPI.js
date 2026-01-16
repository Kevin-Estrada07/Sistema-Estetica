import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    // Guardar token en localStorage
    localStorage.setItem("access_token", res.data.access_token);
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error("Correo o contraseña incorrectos");
    } else {
      throw new Error("Error del servidor");
    }
  }
}; 

export const logout = async () => {
  const token = localStorage.getItem("access_token");
  await axios.post(
    `${API_URL}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  localStorage.removeItem("access_token");
};

export const getUser = async () => {
  const token = localStorage.getItem("access_token");
  const res = await axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
