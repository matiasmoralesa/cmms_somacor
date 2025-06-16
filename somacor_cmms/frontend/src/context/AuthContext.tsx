import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '@/api/apiClient';

interface UserProfile {
    idrol: {
        idrol: number;
        nombrerol: string;
        descripcionrol: string;
    };
    idespecialidad: {
        idespecialidad: number;
        nombreespecialidad: string;
        descripcion: string;
    } | null;
}

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    perfil: UserProfile;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error al parsear datos de usuario desde localStorage", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User, token: string) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout/');
        } catch (error) {
            console.error("Fallo la llamada a la API de logout, pero se procederá con el logout local.", error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
        }
    };
    
    const isAuthenticated = !!user;
    const value = { user, login, logout, isLoading, isAuthenticated };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
