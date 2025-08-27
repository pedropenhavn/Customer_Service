import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8899';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Importante para cookies de sessão
});

// Interceptor para adicionar CSRF token
api.interceptors.request.use((config) => {
  // Obter CSRF token do meta tag se disponível
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionar automaticamente para evitar loops
    // O componente de autenticação deve lidar com isso
    return Promise.reject(error);
  }
);

export default api;
