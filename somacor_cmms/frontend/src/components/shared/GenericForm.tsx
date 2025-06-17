import React, { useState, useEffect, FormEvent } from 'react';
import type { FormField, SelectOption } from '../../../src/types/index.ts';


type OptionsMap = { [key: string]: SelectOption[] };

interface GenericFormProps<T> {
    fields: FormField<T>[];
    initialData: Partial<T> | null;
    selectOptions: OptionsMap;
    onSubmit: (data: Partial<T>) => void;
    onCancel: () => void;
}

export default function GenericForm<T>({ fields, initialData, selectOptions, onSubmit, onCancel }: GenericFormProps<T>) {
    const [formData, setFormData] = useState<Partial<T>>({});

    useEffect(() => {
        const initialFormState = fields.reduce((acc, field) => {
            acc[field.name] = initialData?.[field.name] ?? '';
            return acc;
        }, {} as Partial<T>);
        setFormData(initialFormState);
    }, [initialData, fields]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
                <div key={String(field.name)}>
                    <label htmlFor={String(field.name)} className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <div className="mt-1">
                        {field.type === 'select' ? (
                            <select
                                id={String(field.name)}
                                name={String(field.name)}
                                value={(formData[field.name] as string | number) || ''}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="" disabled>Seleccione una opción</option>
                                {selectOptions[field.name as string]?.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                id={String(field.name)}
                                name={String(field.name)}
                                value={(formData[field.name] as string | number) || ''}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        )}
                    </div>
                </div>
            ))}
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar</button>
            </div>
        </form>
    );
}
