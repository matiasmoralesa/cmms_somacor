import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// Estado inicial para una tarea
const initialTaskState = {
    idtareaestandar: null,
    descripcionactividad: '',
    completada: false,
    observacionesactividad: ''
};

const MaintenanceFormView = () => {
    const { user } = useAuth();
    // Estados para los datos de los dropdowns
    const [equipos, setEquipos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
    const [tareasEstandar, setTareasEstandar] = useState([]);

    // Estado principal del formulario
    const [formData, setFormData] = useState({
        idequipo: '',
        idtecnicoasignado: '',
        idtipomantenimientoot: '',
        horometroequipoingreso: '',
        fechaprogramadainicio: '',
        descripcionproblemareportado: ''
    });

    // Estado para las actividades (tareas) de la OT
    const [actividades, setActividades] = useState([initialTaskState]);

    // Cargar datos para los selects al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equiposRes, tecnicosRes, tiposMantenimientoRes, tareasRes] = await Promise.all([
                    apiClient.get('/equipos/'),
                    apiClient.get('/users/?rol=Técnico'), // Asume que tienes un filtro por rol
                    apiClient.get('/tipos-mantenimiento/'), // Asume este endpoint
                    apiClient.get('/tareas-estandar/')
                ]);
                setEquipos(equiposRes.data.results || equiposRes.data);
                setTecnicos(tecnicosRes.data.results || tecnicosRes.data);
                setTiposMantenimiento(tiposMantenimientoRes.data.results || tiposMantenimientoRes.data);
                setTareasEstandar(tareasRes.data.results || tareasRes.data);
            } catch (error) {
                console.error("Error cargando datos para el formulario:", error);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleActividadChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const list = [...actividades];
        if (name === 'idtareaestandar') {
            const selectedTask = tareasEstandar.find(t => t.idtareaestandar.toString() === value);
            list[index]['idtareaestandar'] = value;
            list[index]['descripcionactividad'] = selectedTask ? selectedTask.descripciontarea : '';
        } else {
            list[index][name] = type === 'checkbox' ? checked : value;
        }
        setActividades(list);
    };

    const handleAddActividad = () => {
        setActividades([...actividades, { ...initialTaskState }]);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            idsolicitante: user.id, // Asigna el usuario logueado como solicitante
            idestadoot: 1, // Asume que '1' es el ID para "Creada" o "Abierta"
            actividades_a_crear: actividades.filter(a => a.idtareaestandar) // Solo envía actividades que tengan una tarea seleccionada
        };

        try {
            await apiClient.post('/ordenes-trabajo/', payload);
            alert('¡Orden de Trabajo creada exitosamente!');
            // Opcional: Resetear el formulario
        } catch (error) {
            console.error("Error al crear la Orden de Trabajo:", error.response.data);
            alert('Error al guardar la Orden de Trabajo. Revise los datos.');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Formulario de Mantenimiento</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campos Principales */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipo</label>
                        <select name="idequipo" value={formData.idequipo} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                            <option value="">-- Seleccione --</option>
                            {equipos.map(eq => <option key={eq.idequipo} value={eq.idequipo}>{eq.nombreequipo}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Técnico Asignado</label>
                        <select name="idtecnicoasignado" value={formData.idtecnicoasignado} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                            <option value="">-- Seleccione --</option>
                            {tecnicos.map(t => <option key={t.id} value={t.id}>{t.first_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
                        <select name="idtipomantenimientoot" value={formData.idtipomantenimientoot} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required>
                           <option value="">-- Seleccione --</option>
                           {tiposMantenimiento.map(tm => <option key={tm.idtipomantenimientoot} value={tm.idtipomantenimientoot}>{tm.nombretipomantenimientoot}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha Programada</label>
                        <input type="date" name="fechaprogramadainicio" value={formData.fechaprogramadainicio} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Horómetro de Ingreso</label>
                        <input type="number" name="horometroequipoingreso" value={formData.horometroequipoingreso} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" placeholder="ej: 12500" required/>
                    </div>
                </div>

                {/* Sección de Actividades */}
                <div className="pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Actividades a Realizar</h3>
                    {actividades.map((actividad, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center mb-4 p-2 border rounded-md">
                            <div className="col-span-4">
                                <label className="text-xs">Tarea</label>
                                <select name="idtareaestandar" value={actividad.idtareaestandar || ''} onChange={e => handleActividadChange(i, e)} className="w-full p-2 border rounded-md">
                                     <option value="">-- Seleccione Tarea --</option>
                                     {tareasEstandar.map(t => <option key={t.idtareaestandar} value={t.idtareaestandar}>{t.descripciontarea}</option>)}
                                </select>
                            </div>
                            <div className="col-span-6">
                                <label className="text-xs">Observaciones</label>
                                <input type="text" name="observacionesactividad" value={actividad.observacionesactividad} onChange={e => handleActividadChange(i, e)} className="w-full p-2 border rounded-md" />
                            </div>
                            <div className="col-span-2 flex items-end justify-center">
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" name="completada" checked={actividad.completada} onChange={e => handleActividadChange(i, e)} className="h-5 w-5"/><span>OK</span></label>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddActividad} className="text-sm text-blue-600 hover:underline">+ Añadir otra actividad</button>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 text-base">Crear Orden de Trabajo</button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceFormView;
