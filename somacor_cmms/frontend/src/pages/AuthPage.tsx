import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/apiClient';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// La interfaz User debería coincidir con la que se define en el AuthContext
interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    perfil: any; 
}

interface LoginResponse {
    token: string;
    user: User;
}

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await apiClient.post<LoginResponse>('/auth/login/', {
                username,
                password,
            });
            login(response.data.user, response.data.token);
            navigate('/dashboard', { replace: true });
            toast.success(`¡Bienvenido, ${response.data.user.first_name}!`);
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Error de autenticación:", axiosError.response?.data);
            if (axiosError.response && axiosError.response.status === 400) {
                 toast.error('Nombre de usuario o contraseña incorrectos.');
            } else {
                 toast.error('Ocurrió un error en el servidor. Por favor, inténtelo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Iniciar sesión en SOMACOR
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;
