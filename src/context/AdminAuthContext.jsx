import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminApi, verifyAdminSession } from '../services/adminApi';
import { ADMIN_UNAUTHORIZED_EVENT } from '../services/apiClient';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const clearSession = () => {
      localStorage.removeItem('ns_stone_admin_token');
      localStorage.removeItem('ns_stone_admin_user');
      if (active) {
        setToken(null);
        setAdmin(null);
      }
    };
    const handleUnauthorized = () => clearSession();
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('ns_stone_admin_token');
      const storedAdmin = localStorage.getItem('ns_stone_admin_user');

      if (!storedToken || !storedAdmin) {
        clearSession();
        if (active) setLoading(false);
        return;
      }

      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        await verifyAdminSession();
        if (active) {
          setToken(storedToken);
          setAdmin(parsedAdmin);
        }
      } catch (error) {
        clearSession();
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          console.error('Unable to verify the saved admin session:', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
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
