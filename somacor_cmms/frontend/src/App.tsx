import { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// CORRECCIÓN: Se utilizan rutas relativas correctas desde `src/App.tsx`
// para que Vite pueda encontrar los archivos.
import { AuthContext, AuthContextType } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import PlaceholderPage from './components/shared/PlaceholderPage';
import AuthPage from './pages/AuthPage';
import DashboardView from './pages/DashboardView';
import FaenasView from './pages/FaenasView';
import TiposEquipoView from './pages/TiposEquipoView';
import EstadoMaquinaView from './pages/EstadoMaquinaView';
import TiposTareaView from './pages/TiposTareaView';
import EquiposMovilesView from './pages/EquiposMovilesView';
import ProfilesView from './pages/ProfilesView';
import MaintenanceConfigView from './pages/MaintenanceConfigView';
import MaintenanceFormView from './pages/MaintenanceFormView';
import UnplannedMaintenanceView from './pages/UnplannedMaintenanceView';
import CalendarView from './pages/CalendarView';
import GeneralInfoView from './pages/GeneralInfoView';


/**
 * Componente para proteger rutas que requieren autenticación.
 * Verifica el estado de autenticación del contexto.
 */
const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext) as AuthContextType;

  // Mientras se verifica el token, muestra un mensaje de carga.
  if (loading) {
    return <div>Verificando autenticación...</div>;
  }

  // Si el usuario no está autenticado, lo redirige a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Si está autenticado, renderiza el layout principal.
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

/**
 * Componente para manejar la redirección inicial desde la ruta raíz ('/').
 */
const HomeRedirect = () => {
    const { isAuthenticated, userRole, loading } = useContext(AuthContext) as AuthContextType;

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // Redirección basada en el rol del usuario.
    switch (userRole) {
        case 'Administrador':
        case 'Supervisor':
            return <Navigate to="/dashboard" replace />;
        case 'Tecnico':
            return <Navigate to="/maintenance-form" replace />;
        default:
            return <Navigate to="/auth" replace />;
    }
}

/**
 * Componente principal de la aplicación que define la estructura de las rutas.
 */
function App() {
  return (
    <Routes>
      {/* Ruta pública para la autenticación */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedLayout />}>
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="faenas" element={<FaenasView />} />
        <Route path="tipos-equipo" element={<TiposEquipoView />} />
        <Route path="estado-maquina" element={<EstadoMaquinaView />} />
        <Route path="tipos-tarea" element={<TiposTareaView />} />
        <Route path="equipos" element={<EquiposMovilesView />} />
        <Route path="perfiles" element={<ProfilesView />} />
        <Route path="config-maintenance" element={<MaintenanceConfigView />} />
        <Route path="maintenance-form" element={<MaintenanceFormView />} />
        <Route path="unplanned-maintenance" element={<UnplannedMaintenanceView />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="general-info" element={<GeneralInfoView />} />
      </Route>

      {/* La ruta raíz redirige usando la lógica de HomeRedirect */}
      <Route path="/" element={<HomeRedirect />} />
      
      {/* Redirección para cualquier ruta no encontrada */}
      <Route path="*" element={<PlaceholderPage message="Página no encontrada. Redirigiendo..." redirectPath="/" />} />
    </Routes>
  );
}

export default App;
