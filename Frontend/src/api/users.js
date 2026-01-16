// src/api/users.js

const API_URL = import.meta.env.VITE_API_URL;

// Registrar usuario
export const registerUser = async ({ name, email, password, role_id, token }) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`  // Token del admin
    },
    body: JSON.stringify({ name, email, password, role_id })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al registrar usuario");
  }

  return data;
};
