import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Ambil URL Backend dari environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jagatetapsehat.com/backend_api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. FUNGSI UNTUK MENYIMPAN TOKEN DI HEADER AXIOS
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token); // Simpan ke storage
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token'); // Hapus dari storage
    }
  };

  // 2. CEK LOGIN SAAT WEBSITE PERTAMA DIBUKA (REFRESH)
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token && token !== "undefined") {
        setAuthToken(token); // Set token lagi
        try {
          // Panggil API /me untuk memastikan token masih valid
          const response = await axios.get(`${BACKEND_URL}/api/auth/me`);
          setUser(response.data.user);
          
          // Simpan user_id juga untuk keperluan lain (seperti checkin)
          if (response.data.user.id) {
            localStorage.setItem('user_id', response.data.user.id);
          }
        } catch (error) {
          console.error("Token expired or invalid:", error);
          logout(); // Jika token basi, logout
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // 3. FUNGSI LOGIN
  const login = async (emailOrPhone, password) => {
    try {
      // Deteksi apakah input berupa email atau telepon
      const payload = {
        password: password
      };

      if (emailOrPhone.includes('@')) {
        payload.email = emailOrPhone;
      } else {
        payload.phone_number = emailOrPhone;
      }

      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, payload);
      
      const { token, user } = response.data;

      // Simpan data penting
      setAuthToken(token);
      setUser(user);
      localStorage.setItem('user_id', user.id);

      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login Gagal" 
      };
    }
  };

  // 4. FUNGSI LOGOUT
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // 5. FUNGSI UNTUK REGISTER (Update agar auto-login setelah daftar)
  const register = async (userData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      // Opsional: Langsung login setelah register, atau minta user login manual
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registrasi Gagal" 
      };
    }
  };

  // Helper untuk Header (Opsional karena sudah ada default axios)
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register,
      getAuthHeader 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
