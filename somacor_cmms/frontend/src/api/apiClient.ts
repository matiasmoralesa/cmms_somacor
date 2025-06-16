import axios, { AxiosError } from 'axios';
// CORRECCIÓN: Se eliminó la importación de 'InternalAxiosRequestConfig' que causaba el error.

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de Peticiones
apiClient.interceptors.request.use(
    // CORRECCIÓN: Se eliminó el tipado explícito "(config: InternalAxiosRequestConfig)".
    // Ahora dejamos que TypeScript infiera el tipo de 'config' automáticamente,
    // lo que es más seguro y compatible entre versiones de Axios.
    (config) => {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; 
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
