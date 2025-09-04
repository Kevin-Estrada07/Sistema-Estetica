import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, getUser as apiGetUser } from "../services/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, intentar obtener usuario desde token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const data = await apiGetUser();
          setUser(data);
        } catch (err) {
          console.error("Token inválido o expirado");
          localStorage.removeItem("access_token");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Función de login
  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
  };

  // Función de logout
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};
