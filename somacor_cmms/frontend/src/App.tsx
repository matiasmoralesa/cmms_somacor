// src/App.tsx
// ARCHIVO CORREGIDO: Se reestructura el anidamiento de rutas para un funcionamiento correcto.

import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardView from './pages/DashboardView';
import EstadoMaquinaView from './pages/EstadoMaquinaView';
import EquiposMovilesView from './pages/EquiposMovilesView';
import CalendarView from './pages/CalendarView';
import UnplannedMaintenanceView from './pages/UnplannedMaintenanceView';
import ProfilesView from './pages/ProfilesView';
import FaenasView from './pages/FaenasView';
import TiposEquipoView from './pages/TiposEquipoView';
import TiposTareaView from './pages/TiposTareaView';
import MaintenanceConfigView from './pages/MaintenanceConfigView';
import MaintenanceFormView from './pages/MaintenanceFormView';
import PlaceholderPage from './components/shared/PlaceholderPage';
import PlanesMantenimientoView from './pages/PlanesMantenimientoView';
import OrdenesTrabajoView from './pages/OrdenesTrabajoView';
import EjecucionOTView from './pages/EjecucionOTView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="estado-maquina" element={<EstadoMaquinaView />} />
        <Route path="equipos-moviles" element={<EquiposMovilesView />} />
        <Route path="calendario" element={<CalendarView />} />
        <Route path="mantenimiento-planificado" element={<MaintenanceFormView />} />
        <Route path="mantenimiento-no-planificado" element={<UnplannedMaintenanceView />} />
        
        {/* --- CORRECCIÓN --- */}
        {/* Se anidan las rutas de Órdenes de Trabajo. Esto asegura que el router
            entienda que '/ordenes-trabajo/:id' es una vista hija de '/ordenes-trabajo'. */}
        <Route path="ordenes-trabajo">
          <Route index element={<OrdenesTrabajoView />} />
          <Route path=":id" element={<EjecucionOTView />} />
        </Route>
        
        {/* Administración */}
        <Route path="admin/perfiles" element={<ProfilesView />} />
        <Route path="admin/programas" element={<PlanesMantenimientoView />} />
        
        {/* Mantenedores */}
        <Route path="mantenedores/faenas" element={<FaenasView />} />
        <Route path="mantenedores/tipos-equipo" element={<TiposEquipoView />} />
        <Route path="mantenedores/tipos-tarea" element={<TiposTareaView />} />
        
        <Route path="config/mantenimiento" element={<MaintenanceConfigView />} />
        
        <Route path="*" element={<PlaceholderPage title="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}

export default App;
