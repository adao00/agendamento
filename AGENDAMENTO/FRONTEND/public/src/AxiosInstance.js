import axios from 'axios';

// Cria instância do Axios com baseURL
const instance = axios.create({
  baseURL: 'http://localhost:3000', // ajuste se estiver usando outra porta
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token JWT automaticamente em cada requisição
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Adiciona o token no cabeçalho
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
