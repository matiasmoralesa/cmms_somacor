// src/pages/OrdenesTrabajoView.tsx
// ARCHIVO ACTUALIZADO: El botón "Ver" ahora navega a la vista de detalle.

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Importado para navegación
import apiClient from '../api/apiClient';
import { Eye, CheckSquare, Clock } from 'lucide-react';
import moment from 'moment';

// --- Interfaces para Tipado ---
interface OrdenTrabajo {
    idordentrabajo: number;
    numeroot: string;
    nombre_equipo: string;
    nombre_tecnico: string;
    estado_ot: string;
    fechaejecucion: string;
}

// --- Vista Principal ---
const OrdenesTrabajoView = () => {
    const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para manejar la navegación

    // --- Carga de Datos ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('ordenes-trabajo/');
            setOrdenes(response.data.results || response.data);
        } catch (err) {
            setError('No se pudieron cargar las órdenes de trabajo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (id: number) => {
        // Navega a la nueva vista de ejecución con el ID de la OT
        navigate(`/ordenes-trabajo/${id}`);
    };

    const getStatusIcon = (status: string) => {
        // ... (función sin cambios)
        switch (status.toLowerCase()) {
            case 'abierta':
                return <Clock size={16} className="text-yellow-500" />;
            case 'completada':
                return <CheckSquare size={16} className="text-green-500" />;
            default:
                return null;
        }
    };

    if (isLoading) return <p>Cargando órdenes de trabajo...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Órdenes de Trabajo Pendientes y Realizadas</h1>
            
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº OT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico Asignado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Ejecución</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordenes.map(ot => (
                            <tr key={ot.idordentrabajo}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{ot.numeroot}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{ot.nombre_equipo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ot.nombre_tecnico}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {moment(ot.fechaejecucion).format('DD/MM/YYYY')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(ot.estado_ot)}
                                        {ot.estado_ot}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleViewDetails(ot.idordentrabajo)} 
                                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md flex items-center hover:bg-gray-300" 
                                        title="Ver y Ejecutar OT"
                                    >
                                        <Eye size={16} className="mr-1" />
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdenesTrabajoView;
