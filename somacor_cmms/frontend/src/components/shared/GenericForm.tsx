import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import Modal from '../ui/Modal';
import GenericForm from './GenericForm';

// Función auxiliar para obtener valores de objetos anidados (ej: 'idfaenaactual.nombrefaena')
const getNestedValue = (obj, path) => {
    if (!path) return 'N/A';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const GenericCRUD = ({ title, apiEndpoint, columns, formFields, idAccessor }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await apiClient.get(apiEndpoint);
            setData(response.data.results || response.data);
        } catch (err) {
            setError('No se pudieron cargar los datos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
            try {
                await apiClient.delete(`${apiEndpoint}${id}/`);
                fetchData();
            } catch (err) {
                alert('Error al eliminar el elemento.');
            }
        }
    };
    
    const handleSave = async (formData) => {
        const method = currentItem ? 'put' : 'post';
        const url = currentItem ? `${apiEndpoint}${currentItem[idAccessor]}/` : apiEndpoint;
        
        try {
            await apiClient[method](url, formData);
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            alert('Error al guardar.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <PlusCircle size={20} className="mr-2" />
                    Crear Nuevo
                </button>
            </div>
            {isLoading && <p>Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map(item => (
                                <tr key={item[idAccessor]}>
                                    {columns.map(col => (
                                        <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {typeof getNestedValue(item, col.accessor) === 'boolean'
                                                ? getNestedValue(item, col.accessor) ? 'Sí' : 'No'
                                                : getNestedValue(item, col.accessor) || 'N/A'
                                            }
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(item[idAccessor])} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? `Editar ${title}` : `Crear ${title}`}>
                <GenericForm 
                    fields={formFields} 
                    currentItem={currentItem} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
};

export default GenericCRUD;
