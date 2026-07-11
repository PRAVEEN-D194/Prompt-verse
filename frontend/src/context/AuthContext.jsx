import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const userData = {
      _id: response.data.user.id,
      name: response.data.user.username,
      email: response.data.user.email,
      role: response.data.user.role,
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", response.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
  };

  const register = async (userDataForm) => {
    const response = await authService.register(userDataForm);
    const newUser = {
      _id: response.data.user.id,
      name: response.data.user.username,
      email: response.data.user.email,
      role: response.data.user.role,
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", response.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
