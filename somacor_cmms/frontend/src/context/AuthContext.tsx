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
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  perfil: UserProfile;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const { data } = await apiClient.get('/users/me/');
          setUser(data);
        } catch (error) {
          console.error("Fallo al verificar el token, se procede a limpiar.", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.error("Fallo la llamada a la API de logout, pero se procederá con el logout local.", error);
    } finally {
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = '/auth';
    }
  };

  const isAuthenticated = !!user;
  const userRole = user?.perfil?.idrol?.nombrerol ?? null;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
    userRole,
  };

  console.log("AuthContext cargado:", value);

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <div>Cargando autenticación...</div> : children}
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
