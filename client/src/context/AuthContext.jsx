import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user info exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Invalid user data');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response.data.success) {
      // Store token and user info in localStorage
      const token = response.data.token;
      const userInfo = { 
        email, 
        name: response.data.name || email.split('@')[0],
        token 
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
    }
    return response.data;
  };

  const signup = async (name, email, password) => {
    const response = await authAPI.signup({ name, email, password });
    return response.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
