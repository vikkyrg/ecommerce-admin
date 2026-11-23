import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminApi } from '../services/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ns_stone_admin_token');
      const storedAdmin = localStorage.getItem('ns_stone_admin_user');
      if (storedToken && storedAdmin) {
        setToken(storedToken);
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (e) {
      console.warn('Failed to parse admin credentials:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginAdminApi(email, password);
      setAdmin(data);
      setToken(data.token);
      localStorage.setItem('ns_stone_admin_token', data.token);
      localStorage.setItem('ns_stone_admin_user', JSON.stringify(data));
      return { success: true, admin: data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('ns_stone_admin_token');
    localStorage.removeItem('ns_stone_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!admin,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
