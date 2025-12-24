import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// --- PERBAIKAN DI SINI ---
// HAPUS: const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// GANTI JADI URL ASLI (Hardcode):
const BACKEND_URL = "https://jagatetapsehat.com/backend_api"; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      // Hasilnya akan jadi: https://jagatetapsehat.com/backend_api/api/auth/me
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        params: { token }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone_number, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        phone_number,
        password
      });
      
      const { access_token, user_id, name, role } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user_id);
      setToken(access_token);
      setUser({ user_id, name, role });
      
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (name, phone_number, email, password, referral_code) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name,
        phone_number,
        email,
        password,
        referral_code
      });
      
      const { access_token, user_id, role } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user_id);
      setToken(access_token);
      setUser({ user_id, name, role });
      
      return { success: true, role };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setToken(null);
    setUser(null);
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      getAuthHeader,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
