import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user profile on mount (or when token changes)
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user info:', err);
        // Token is probably invalid or expired, logout
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authAPI.login({ email, password });
      
      // Destructure data correctly
      const userData = res.data;
      const userToken = res.data.token;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      toast.success('Welcome back!');
      return res.data;
    } catch (err) {
      setAuthError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      
      const userData = res.data;
      const userToken = res.data.token;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      toast.success('Account created successfully!');
      return res.data;
    } catch (err) {
      setAuthError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      authError,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
