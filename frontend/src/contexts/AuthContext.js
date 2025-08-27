import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    if (!checked) {
      checkAuth();
    }
  }, [checked]);

  const checkAuth = async () => {
    if (checked) return; // Evita múltiplas chamadas
    
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Usuário não autenticado');
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });

      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao registrar';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
