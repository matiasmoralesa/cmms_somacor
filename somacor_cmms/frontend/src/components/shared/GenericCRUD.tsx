import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/api/apiClient';
import Modal from '@/components/ui/Modal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import GenericForm from '@/components/shared/GenericForm';
import { ColumnDefinition, FormField, SelectOption } from '@/types';

type OptionsMap = { [key: string]: SelectOption[] };

interface GenericCRUDProps<T extends { [key: string]: any }> {
    endpoint: string;
    title: string;
    columns: ColumnDefinition<T>[];
    formFields: FormField<T>[];
    pkField: keyof T;
}

export function GenericCRUD<T extends { [key:string]: any }>({
    endpoint,
    title,
    columns,
    formFields,
    pkField,
}: GenericCRUDProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [selectOptions, setSelectOptions] = useState<OptionsMap>({});

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<T[]>(`/${endpoint}/`);
            setData(response.data);
        } catch (err) {
            setError('No se pudieron cargar los datos.');
            toast.error('Error al cargar los datos.');
        } finally {
            setIsLoading(false);
        }
    }, [endpoint]);

    const fetchSelectOptions = useCallback(async () => {
        const optionsPromises = formFields
            .filter(field => field.type === 'select' && field.optionsSource)
            .map(async field => {
                try {
                    const source = field.optionsSource!;
                    const response = await apiClient.get<any[]>(`/${source.endpoint}/`);
                    const options = response.data.map(item => ({
                        value: item[source.valueField],
                        label: item[source.labelField],
                    }));
                    return { key: field.name as string, options };
                } catch (error) {
                    toast.error(`Error al cargar opciones para ${field.label}`);
                    return { key: field.name as string, options: [] };
                }
            });
        
        const resolvedOptions = await Promise.all(optionsPromises);
        const optionsMap = resolvedOptions.reduce((acc, { key, options }) => {
            acc[key] = options;
            return acc;
        }, {} as OptionsMap);
        
        setSelectOptions(optionsMap);
    }, [formFields]);

    useEffect(() => {
        fetchData();
        fetchSelectOptions();
    }, [fetchData, fetchSelectOptions]);
    
    const handleSave = async (itemData: Partial<T>) => {
        try {
            if (selectedItem) {
                const id = selectedItem[pkField];
                await apiClient.put(`/${endpoint}/${id}/`, itemData);
                toast.success('Elemento actualizado con éxito!');
            } else {
                await apiClient.post(`/${endpoint}/`, itemData);
                toast.success('Elemento creado con éxito!');
            }
            closeFormModal();
            fetchData();
        } catch (err) {
            toast.error('Error al guardar el elemento.');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await apiClient.delete(`/${endpoint}/${itemToDelete[pkField]}/`);
            toast.success('Elemento eliminado con éxito!');
            fetchData();
        } catch (err) {
            toast.error('Error al eliminar el elemento.');
        } finally {
            closeDeleteModal();
        }
    };

    const openFormModal = (item: T | null = null) => {
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };
    const closeFormModal = () => setIsFormModalOpen(false);

    const openDeleteModal = (item: T) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);
    
    if (isLoading) return <div className="p-4">Cargando {title}...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <button onClick={() => openFormModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Añadir Nuevo</button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, index) => <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>)}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item[pkField]}>
                                {columns.map((col, index) => (
                                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor] ?? '')}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openFormModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                    <button onClick={() => openDeleteModal(item)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormModalOpen && (
                <Modal title={selectedItem ? `Editar ${title}` : `Añadir ${title}`} onClose={closeFormModal}>
                    <GenericForm fields={formFields} initialData={selectedItem} onSubmit={handleSave} onCancel={closeFormModal} selectOptions={selectOptions} />
                </Modal>
            )}

            {isDeleteModalOpen && itemToDelete && (
                 <ConfirmationModal
                    title="Confirmar Eliminación"
                    message="¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onCancel={closeDeleteModal}
                />
            )}
        </div>
    );
}
