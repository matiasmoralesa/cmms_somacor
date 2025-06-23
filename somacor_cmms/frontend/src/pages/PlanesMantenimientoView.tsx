import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusCircle, BookOpen, Trash2, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import Modal from '../components/ui/Modal';
import GenericForm from '../components/shared/GenericForm';

// --- Interfaces para el tipado de datos ---
interface TipoEquipo {
    idtipoequipo: number;
    nombretipo: string;
}

interface TareaEstandar {
    idtareaestandar: number;
    descripciontarea: string;
}

interface DetallePlan {
    iddetalleplan: number;
    intervalohorasoperacion: number;
    idtareaestandar: TareaEstandar;
}

interface Plan {
    idplanmantenimiento: number;
    nombreplan: string;
    idtipoequipo: number;
    nombre_tipo_equipo: string;
    detalles: DetallePlan[];
}

// --- Sub-componente para gestionar los detalles (tareas) de un plan ---
const PlanDetails = ({ plan, tareasEstandar, onClose, onDataChange }) => {
    const [nuevaTarea, setNuevaTarea] = useState({ idtareaestandar_id: '', intervalohorasoperacion: '' });
    
    const tareasAgrupadas = useMemo(() => {
        return plan.detalles.reduce((acc, detalle) => {
            const key = detalle.intervalohorasoperacion;
            if (!acc[key]) acc[key] = [];
            acc[key].push(detalle);
            return acc;
        }, {} as Record<number, DetallePlan[]>);
    }, [plan.detalles]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaTarea.idtareaestandar_id || !nuevaTarea.intervalohorasoperacion) {
            alert('Por favor, seleccione una tarea y especifique el intervalo de horas.');
            return;
        }
        try {
            await apiClient.post('detalles-plan-mantenimiento/', {
                idplanmantenimiento: plan.idplanmantenimiento,
                idtareaestandar_id: parseInt(nuevaTarea.idtareaestandar_id, 10),
                intervalohorasoperacion: parseInt(nuevaTarea.intervalohorasoperacion, 10)
            });
            setNuevaTarea({ idtareaestandar_id: '', intervalohorasoperacion: '' });
            onDataChange();
        } catch (err) {
            alert('Error al añadir la tarea.');
            console.error(err.response?.data);
        }
    };

    const handleDeleteTask = async (idDetalle: number) => {
        if (window.confirm('¿Está seguro de que desea quitar esta tarea del plan?')) {
            try {
                await apiClient.delete(`detalles-plan-mantenimiento/${idDetalle}/`);
                onDataChange();
            } catch (err) {
                alert('Error al quitar la tarea.');
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{plan.nombreplan}</h3>
                <p className="text-sm text-gray-500">Tipo de Equipo: {plan.nombre_tipo_equipo}</p>
            </div>

            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tarea a Añadir</label>
                    <select value={nuevaTarea.idtareaestandar_id} onChange={(e) => setNuevaTarea(prev => ({ ...prev, idtareaestandar_id: e.target.value }))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="">-- Seleccione una tarea --</option>
                        {tareasEstandar.map(t => <option key={t.idtareaestandar} value={t.idtareaestandar}>{t.descripciontarea}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Intervalo (Horas)</label>
                    <input type="number" placeholder="Ej: 250" value={nuevaTarea.intervalohorasoperacion} onChange={(e) => setNuevaTarea(prev => ({...prev, intervalohorasoperacion: e.target.value}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                        <PlusCircle size={18} className="mr-2" />
                        Añadir Tarea al Plan
                    </button>
                </div>
            </form>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {Object.keys(tareasAgrupadas).sort((a,b) => Number(a) - Number(b)).map(intervalo => (
                    <div key={intervalo}>
                        <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">PM ({intervalo} HRS)</h4>
                        <ul className="space-y-2">
                            {tareasAgrupadas[intervalo].map(detalle => (
                                <li key={detalle.iddetalleplan} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                                    <span className="text-sm text-gray-800">{detalle.idtareaestandar.descripciontarea}</span>
                                    <button onClick={() => handleDeleteTask(detalle.iddetalleplan)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
             <div className="flex justify-end pt-4">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cerrar</button>
            </div>
        </div>
    );
};

// --- Vista Principal ---
const PlanesMantenimientoView = () => {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([]);
    const [tareasEstandar, setTareasEstandar] = useState<TareaEstandar[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Plan | null>(null);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [planesRes, tiposEquipoRes, tareasRes] = await Promise.all([
                apiClient.get('planes-mantenimiento/'),
                apiClient.get('tipos-equipo/'),
                apiClient.get('tareas-estandar/')
            ]);
            setPlanes(planesRes.data.results || planesRes.data);
            setTiposEquipo(tiposEquipoRes.data.results || tiposEquipoRes.data);
            setTareasEstandar(tareasRes.data.results || tareasRes.data);
        } catch (err) {
            setError('No se pudieron cargar los datos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        setCurrentItem(null);
        setIsPlanModalOpen(true);
    };

    const handleViewDetails = (plan: Plan) => {
        setCurrentItem(plan);
        setIsDetailModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este plan y todas sus tareas asociadas?')) {
            try {
                await apiClient.delete(`planes-mantenimiento/${id}/`);
                fetchData();
            } catch (err) {
                alert('Error al eliminar el plan.');
            }
        }
    };

    const handleSavePlan = async (formData) => {
        try {
            await apiClient.post('planes-mantenimiento/', {
                nombreplan: formData.nombreplan,
                idtipoequipo: formData.idtipoequipo,
                detalles: []
            });
            fetchData();
            setIsPlanModalOpen(false);
        } catch (err) {
            alert('Error al guardar el plan.');
        }
    };

    const formFields = [
        { name: 'nombreplan', label: 'Nombre del Programa' },
        {
            name: 'idtipoequipo',
            label: 'Tipo de Equipo Asociado',
            type: 'select',
            options: tiposEquipo.map(t => ({ value: t.idtipoequipo, label: t.nombretipo }))
        },
    ];

    if (isLoading) return <p>Cargando datos...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Programas de Mantenimiento</h1>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <PlusCircle size={20} className="mr-2" />
                    Crear Nuevo Programa
                </button>
            </div>

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Programa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Equipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº de Tareas</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {planes.map(plan => (
                            <tr key={plan.idplanmantenimiento}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.nombreplan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.nombre_tipo_equipo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.detalles.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <>
                                        <button onClick={() => handleViewDetails(plan)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Gestionar Tareas del Plan">
                                            <BookOpen size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(plan.idplanmantenimiento)} className="text-red-600 hover:text-red-900" title="Eliminar Plan">
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title="Crear Nuevo Programa">
                <GenericForm
                    fields={formFields}
                    currentItem={null}
                    onSave={handleSavePlan}
                    onCancel={() => setIsPlanModalOpen(false)}
                />
            </Modal>
            
            {currentItem && (
                 <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detalles del Programa de Mantenimiento">
                    <PlanDetails
                        plan={currentItem}
                        tareasEstandar={tareasEstandar}
                        onClose={() => setIsDetailModalOpen(false)}
                        onDataChange={fetchData}
                    />
                </Modal>
            )}
        </div>
    );
};

export default PlanesMantenimientoView;
