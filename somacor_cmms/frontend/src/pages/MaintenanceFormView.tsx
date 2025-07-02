import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

interface Equipo {
    idequipo: number;
    nombreequipo: string;
    codigointerno: string;
    idtipoequipo: number;
}

interface Plan {
    idplanmantenimiento: number;
    nombreplan: string;
    idtipoequipo: number;
    detalles: { intervalohorasoperacion: number }[];
}

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

const MaintenanceFormView: React.FC = () => {
    // Estados para los datos
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    
    // Estados del formulario
    const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [selectedIntervalo, setSelectedIntervalo] = useState<string>('');
    const [selectedTecnicoId, setSelectedTecnicoId] = useState<string>('');
    const [fechaEjecucion, setFechaEjecucion] = useState<string>('');

    // Estados de la UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equiposRes, planesRes, usersRes] = await Promise.all([
                    apiClient.get('/equipos/'),
                    apiClient.get('/planes-mantenimiento/'),
                    apiClient.get('/users/')
                ]);
                
                console.log('Debug - Equipos cargados:', equiposRes.data.results);
                console.log('Debug - Planes cargados:', planesRes.data.results);
                console.log('Debug - Usuarios cargados:', usersRes.data.results);
                
                setEquipos(equiposRes.data.results || []);
                setPlanes(planesRes.data.results || []);
                setTecnicos(usersRes.data.results || []);
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError("No se pudieron cargar los datos necesarios.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Obtener equipo seleccionado
    const getEquipoSeleccionado = (): Equipo | null => {
        if (!selectedEquipoId) return null;
        return equipos.find(eq => eq.idequipo.toString() === selectedEquipoId) || null;
    };

    // Obtener planes disponibles para el equipo seleccionado
    const getPlanesDisponibles = (): Plan[] => {
        const equipo = getEquipoSeleccionado();
        if (!equipo) return [];
        return planes.filter(p => p.idtipoequipo === equipo.idtipoequipo);
    };

    // Obtener plan seleccionado
    const getPlanSeleccionado = (): Plan | null => {
        if (!selectedPlanId) return null;
        return planes.find(p => p.idplanmantenimiento.toString() === selectedPlanId) || null;
    };

    // Obtener intervalos disponibles para el plan seleccionado
    const getIntervalosDisponibles = (): number[] => {
        const plan = getPlanSeleccionado();
        if (!plan || !plan.detalles) return [];
        const intervalos = plan.detalles.map(d => d.intervalohorasoperacion);
        return [...new Set(intervalos)].sort((a, b) => a - b);
    };

    // Manejar cambio de equipo
    const handleEquipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        console.log('Debug - handleEquipoChange:', value);
        setSelectedEquipoId(value);
        setSelectedPlanId(''); // Reset plan
        setSelectedIntervalo(''); // Reset intervalo
        console.log('Debug - Estado actualizado, equipoId:', value);
    };

    // Manejar cambio de plan
    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPlanId(value);
        setSelectedIntervalo(''); // Reset intervalo
    };

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const payload = {
                idequipo: parseInt(selectedEquipoId),
                idplanmantenimiento: parseInt(selectedPlanId),
                intervalohorasoperacion: parseInt(selectedIntervalo),
                idtecnicoasignado: parseInt(selectedTecnicoId),
                fechaejecucionprogramada: fechaEjecucion,
                idsolicitante: 1 // Por ahora hardcodeado
            };

            await apiClient.post('/mantenimiento-workflow/crear-ot-planificada/', payload);
            setSuccess('Orden de trabajo creada exitosamente.');
            
            // Resetear formulario
            setSelectedEquipoId('');
            setSelectedPlanId('');
            setSelectedIntervalo('');
            setSelectedTecnicoId('');
            setFechaEjecucion('');
        } catch (err: any) {
            console.error("Error al crear la OT:", err.response?.data);
            setError(err.response?.data?.error || 'Ocurrió un error al crear la OT.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-lg">Cargando...</p>
            </div>
        );
    }

    const planesDisponibles = getPlanesDisponibles();
    const intervalosDisponibles = getIntervalosDisponibles();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-8">
                <Wrench size={32} className="text-blue-600 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Crear Mantenimiento Planificado</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                        <AlertCircle size={20}/> {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-4" role="alert">
                        <CheckCircle size={20}/> {success}
                    </div>
                )}

                {/* Paso 1: Seleccionar Equipo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        1. Seleccione el Equipo
                    </label>
                    <select 
                        value={selectedEquipoId} 
                        onChange={(e) => {
                            console.log('Debug - onChange ejecutado:', e.target.value);
                            setSelectedEquipoId(e.target.value);
                            setSelectedPlanId('');
                            setSelectedIntervalo('');
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        required
                    >
                        <option value="">-- Elija un equipo --</option>
                        {equipos.map(eq => (
                            <option key={eq.idequipo} value={eq.idequipo}>
                                {eq.nombreequipo} ({eq.codigointerno})
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500">Debug: selectedEquipoId = {selectedEquipoId}</p>
                </div>

                {/* Paso 2: Seleccionar Programa de Mantenimiento */}
                {selectedEquipoId && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            2. Seleccione el Programa de Mantenimiento
                        </label>
                        <select 
                            value={selectedPlanId} 
                            onChange={handlePlanChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={planesDisponibles.length === 0}
                        >
                            <option value="">
                                {planesDisponibles.length === 0 ? 'No hay programas para este tipo de equipo' : '-- Elija un programa --'}
                            </option>
                            {planesDisponibles.map(p => (
                                <option key={p.idplanmantenimiento} value={p.idplanmantenimiento}>
                                    {p.nombreplan}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Paso 3: Seleccionar Intervalo */}
                {selectedPlanId && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            3. Seleccione la Pauta a Ejecutar (Horómetro)
                        </label>
                        <select 
                            value={selectedIntervalo} 
                            onChange={(e) => setSelectedIntervalo(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required
                        >
                            <option value="">-- Elija un intervalo de horas --</option>
                            {intervalosDisponibles.map(intervalo => (
                                <option key={intervalo} value={intervalo}>
                                    PM ({intervalo} HRS)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Paso 4: Asignar Técnico y Fecha */}
                {selectedIntervalo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                4. Asignar Técnico Principal
                            </label>
                            <select 
                                value={selectedTecnicoId} 
                                onChange={(e) => setSelectedTecnicoId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                required
                            >
                                <option value="">-- Elija un técnico --</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name} ({t.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                5. Fecha de Ejecución Programada
                            </label>
                            <input 
                                type="date" 
                                value={fechaEjecucion} 
                                onChange={(e) => setFechaEjecucion(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                required 
                            />
                        </div>
                    </div>
                )}
                
                {/* Botón de envío */}
                {selectedIntervalo && selectedTecnicoId && fechaEjecucion && (
                    <div className="flex justify-end pt-6">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-base font-medium shadow-md transition-colors"
                        >
                            Generar Orden de Trabajo
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MaintenanceFormView;

