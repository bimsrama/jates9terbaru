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
        setAuthToken(token); // Pasang token lagi ke header
        try {
          // Validasi ke Backend (Endpoint /me)
          const response = await axios.get(`${BACKEND_URL}/api/auth/me`);
          setUser(response.data.user);
          
          // Simpan User ID cadangan
          if (response.data.user.id) {
            localStorage.setItem('user_id', response.data.user.id);
          }
        } catch (error) {
          console.error("Sesi habis:", error);
          logout(); // Jika token basi/invalid, logout otomatis
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // 2. FUNGSI LOGIN (Updated: Phone Number Only)
  const login = async (phoneNumber, password) => {
    try {
      // Backend mengharapkan JSON { phone_number, password }
      const payload = { 
        phone_number: phoneNumber, 
        password: password 
      };

      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, payload);
      const { token, user } = response.data;

      // Simpan Sesi
      setAuthToken(token);
      setUser(user);
      localStorage.setItem('user_id', user.id);

      return { success: true, role: user.role };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Login Gagal. Periksa koneksi Anda." 
      };
    }
  };

  // 3. FUNGSI LOGOUT
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    // Opsional: Redirect ke halaman login
    // window.location.href = '/login'; 
  };

  // 4. FUNGSI REGISTER (Updated: Auto Login after Register)
  const register = async (userData) => {
    try {
      // userData berisi: { name, phone_number, password, referral_code }
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      
      // Backend sekarang mengembalikan TOKEN juga saat register sukses
      const { token, user } = response.data;
      
      if (token) {
        setAuthToken(token);
        setUser(user);
        localStorage.setItem('user_id', user.id);
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Registrasi Gagal" 
      };
    }
  };

  // Helper untuk mendapatkan Header Authorization (Bearer Token)
  // Berguna saat memanggil API protected secara manual di komponen lain
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
