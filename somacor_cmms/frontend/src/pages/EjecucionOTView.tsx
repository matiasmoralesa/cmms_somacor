// src/pages/EjecucionOTView.tsx
// ARCHIVO NUEVO: Componente para ver y ejecutar las tareas de una Orden de Trabajo.

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import moment from 'moment';
import { ChevronLeft, Save } from 'lucide-react';

// --- Interfaces de Tipos ---
interface TareaEstandar {
    idtareaestandar: number;
    descripciontarea: string;
    procedimiento: string;
}

interface Actividad {
    idactividadot: number;
    idtareaestandar: TareaEstandar;
    estado: string;
    observaciones: string;
}

interface OrdenTrabajoDetallada {
    idordentrabajo: number;
    numeroot: string;
    nombre_equipo: string;
    marca_equipo: string;
    modelo_equipo: string;
    nombre_tecnico: string;
    departamento_solicitante: string;
    nombre_solicitante: string;
    fechaejecucion: string;
    horometro: number;
    observacionesgenerales: string;
    actividades: Actividad[];
}

// --- Vista de Ejecución ---
const EjecucionOTView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ordenTrabajo, setOrdenTrabajo] = useState<OrdenTrabajoDetallada | null>(null);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Carga de datos de la OT ---
    useEffect(() => {
        const fetchOTDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get(`ordenes-trabajo/${id}/`);
                setOrdenTrabajo(response.data);
                setActividades(response.data.actividades || []);
            } catch (err) {
                setError('No se pudo cargar la orden de trabajo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOTDetails();
    }, [id]);

    // --- Manejadores de eventos ---
    const handleActivityChange = (idActividad: number, field: 'estado' | 'observaciones', value: string) => {
        setActividades(prev =>
            prev.map(act =>
                act.idactividadot === idActividad ? { ...act, [field]: value } : act
            )
        );
    };

    const handleSaveChanges = async () => {
        try {
            // Se envían todas las actualizaciones de actividades en paralelo
            await Promise.all(
                actividades.map(act =>
                    apiClient.patch(`actividades-ot/${act.idactividadot}/`, {
                        estado: act.estado,
                        observaciones: act.observaciones
                    })
                )
            );
            alert('¡Cambios guardados exitosamente!');
            navigate('/ordenes-trabajo');
        } catch (err) {
            alert('Error al guardar los cambios.');
            console.error(err);
        }
    };

    if (isLoading) return <p>Cargando detalles de la OT...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!ordenTrabajo) return <p>No se encontró la orden de trabajo.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/ordenes-trabajo')} className="flex items-center text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={20} className="mr-1" />
                    Volver a la Lista de OTs
                </button>
                <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <Save size={18} className="mr-2" />
                    Guardar Progreso
                </button>
            </div>
            
            {/* Encabezado del Informe */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Ejecución de Orden de Trabajo: {ordenTrabajo.numeroot}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                    <div><strong>Equipo:</strong> {ordenTrabajo.nombre_equipo}</div>
                    <div><strong>Fecha Ejecución:</strong> {moment(ordenTrabajo.fechaejecucion).format('DD/MM/YYYY')}</div>
                    <div><strong>Horómetro:</strong> {ordenTrabajo.horometro} hrs</div>
                    <div><strong>Técnico Asignado:</strong> {ordenTrabajo.nombre_tecnico}</div>
                    <div><strong>Solicitante:</strong> {ordenTrabajo.nombre_solicitante}</div>
                    <div><strong>Departamento:</strong> {ordenTrabajo.departamento_solicitante || 'N/A'}</div>
                </div>
            </div>

            {/* Lista de Tareas a Ejecutar */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Tareas de Mantenimiento</h2>
                <div className="space-y-4">
                    {actividades.map((act, index) => (
                        <div key={act.idactividadot} className="grid grid-cols-12 gap-4 border-b pb-4">
                            <div className="col-span-12 md:col-span-5">
                                <label className="block text-xs font-medium text-gray-500">N°{index + 1} - Tarea</label>
                                <p className="text-sm text-gray-900 font-medium">{act.idtareaestandar.descripciontarea}</p>
                                <p className="text-xs text-gray-600 mt-1">({act.idtareaestandar.procedimiento})</p>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500">Estado</label>
                                <select 
                                    value={act.estado || ''}
                                    onChange={(e) => handleActivityChange(act.idactividadot, 'estado', e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md text-sm"
                                >
                                    <option value="">Pendiente</option>
                                    <option value="OK">OK</option>
                                    <option value="N/A">N/A</option>
                                    <option value="Con Fallo">Con Fallo</option>
                                </select>
                            </div>
                            <div className="col-span-6 md:col-span-5">
                                <label className="block text-xs font-medium text-gray-500">Observaciones</label>
                                <input
                                    type="text"
                                    value={act.observaciones || ''}
                                    onChange={(e) => handleActivityChange(act.idactividadot, 'observaciones', e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md text-sm"
                                    placeholder="Añadir observaciones..."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EjecucionOTView;
