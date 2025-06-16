import React from 'react';
import { GenericCRUD } from '@/components/shared/GenericCRUD';
import { ColumnDefinition, FormField } from '@/types';

interface TipoEquipo {
    idtipoequipo: number;
    nombretipo: string;
    descripcion: string | null;
}

const columns: ColumnDefinition<TipoEquipo>[] = [
    { header: 'ID', accessor: 'idtipoequipo' },
    { header: 'Nombre del Tipo', accessor: 'nombretipo' },
    { header: 'Descripción', accessor: 'descripcion' },
];

const formFields: FormField<TipoEquipo>[] = [
    { name: 'nombretipo', label: 'Nombre del Tipo', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

const TiposEquipoView: React.FC = () => {
    return (
        <GenericCRUD<TipoEquipo>
            title="Gestión de Tipos de Equipo"
            endpoint="tipos-equipo"
            columns={columns}
            formFields={formFields}
            pkField="idtipoequipo"
        />
    );
};

export default TiposEquipoView;
