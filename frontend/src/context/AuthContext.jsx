import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Gunakan URL Backend Anda
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Set Token ke Header Axios & LocalStorage
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // 1. CEK STATUS LOGIN SAAT WEBSITE DI-REFRESH
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token && token !== "undefined") {
        setAuthToken(token); // Pasang token lagi
        try {
          // Validasi ke Backend
          const response = await axios.get(`${BACKEND_URL}/api/auth/me`);
          setUser(response.data.user);
          
          // Simpan User ID cadangan
          if (response.data.user.id) {
            localStorage.setItem('user_id', response.data.user.id);
          }
        } catch (error) {
          console.error("Sesi habis:", error);
          logout(); // Jika token basi, logout otomatis
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // 2. FUNGSI LOGIN
  const login = async (emailOrPhone, password) => {
    try {
      const payload = { password };
      // Cek apakah input Email atau No HP
      if (emailOrPhone.includes('@')) {
        payload.email = emailOrPhone;
      } else {
        payload.phone_number = emailOrPhone;
      }

      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, payload);
      const { token, user } = response.data;

      // Simpan Sesi
      setAuthToken(token);
      setUser(user);
      localStorage.setItem('user_id', user.id);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login Gagal" 
      };
    }
  };

  // 3. FUNGSI LOGOUT
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // 4. FUNGSI REGISTER
  const register = async (userData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registrasi Gagal" 
      };
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, getAuthHeader }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
