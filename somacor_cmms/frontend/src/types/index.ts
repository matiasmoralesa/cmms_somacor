import React from 'react';

// Interfaz para las opciones de un select
export interface SelectOption {
    value: string | number;
    label: string;
}

// Definición de tipo para las columnas de la tabla.
// Permite un string (acceso directo) o una función para renderizado complejo.
export interface ColumnDefinition<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode); 
}

// Definición de tipo para los campos del formulario.
export interface FormField<T> {
    name: keyof T;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select';
    // Para campos 'select', especifica de dónde cargar las opciones
    optionsSource?: {
        endpoint: string;
        valueField: string;
        labelField: string;
    };
}