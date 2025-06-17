import React from 'react';

// Interfaz para las opciones de un select
export interface SelectOption {
    value: string | number;
    label: string;
}

// Definición de tipo para las columnas de la tabla.
export interface ColumnDefinition<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode); 
}

export type { FormField, ColumnDefinition, SelectOption };
