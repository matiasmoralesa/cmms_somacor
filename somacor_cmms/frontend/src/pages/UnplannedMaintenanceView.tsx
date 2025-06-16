import React, { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const UnplannedMaintenanceView = () => {
    const { user } = useAuth();
    const [equipos, setEquipos] = useState([]);
    
    const initialFormState = {
        idequipo: '',
        descripcionot: '', // Campo corregido según modelo
        fechacreacion: new Date().toISOString().slice(0, 16),
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const response = await apiClient.get('/equipos/');
                setEquipos(response.data);
            } catch (error) {
                console.error("Error cargando equipos:", error);
                toast.error("No se pudieron cargar los equipos.");
            }
        };
        fetchEquipos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedEquipo = equipos.find(eq => eq.idequipo == formData.idequipo);
        if (!selectedEquipo) {
            toast.error("Por favor, seleccione un equipo válido.");
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            idusuariocreador: user.id,
            idtipomantenimiento: 2, // Asume que '2' es el ID para "Correctivo"
            idestado: 1, // Asume que '1' es el ID para "Abierta"
            idfaena: selectedEquipo.idfaena,
        };

        try {
            await apiClient.post('/ordenes-trabajo/', payload);
            toast.success('¡Reporte de falla y OT Correctiva creada exitosamente!');
            setFormData(initialFormState); // Resetear el formulario
        } catch (err) {
            console.error("Error al crear la Orden de Trabajo:", err.response?.data);
            toast.error('Error al guardar el reporte. Revise los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center mb-8">
                <AlertTriangle size={32} className="text-red-500 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Reportar Falla Urgente</h1>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipo con Falla</label>
                        <select name="idequipo" value={formData.idequipo} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                            <option value="">-- Seleccione un equipo --</option>
                            {equipos.map(eq => <option key={eq.idequipo} value={eq.idequipo}>{eq.codigoequipo} - {eq.descripcion}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha y Hora del Reporte</label>
                        <input 
                            type="datetime-local" 
                            name="fechacreacion" 
                            value={formData.fechacreacion} 
                            readOnly 
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción del Problema</label>
                    <textarea 
                        name="descripcionot" 
                        value={formData.descripcionot} 
                        onChange={handleInputChange} 
                        rows={6} 
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" 
                        placeholder="Describa detalladamente la falla o el problema observado..."
                        required
                    ></textarea>
                </div>
                
                <div className="flex justify-end pt-6">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 text-base shadow-md transition-colors"
                    >
                        {loading ? 'Enviando Reporte...' : 'Crear Reporte de Falla'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UnplannedMaintenanceView;
