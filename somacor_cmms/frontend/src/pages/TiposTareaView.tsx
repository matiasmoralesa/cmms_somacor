import React from 'react';
import { GenericCRUD } from '@/components/shared/GenericCRUD';
import { ColumnDefinition, FormField } from '@/types';

interface TipoTarea {
    idtipotarea: number;
    nombretipotarea: string;
}

const columns: ColumnDefinition<TipoTarea>[] = [
    { header: 'ID', accessor: 'idtipotarea' },
    { header: 'Nombre del Tipo de Tarea', accessor: 'nombretipotarea' },
];

const formFields: FormField<TipoTarea>[] = [
    { name: 'nombretipotarea', label: 'Nombre del Tipo de Tarea', type: 'text' },
];

const TiposTareaView: React.FC = () => {
    return (
        <GenericCRUD<TipoTarea>
            title="Gestión de Tipos de Tarea"
            endpoint="tipos-tarea"
            columns={columns}
            formFields={formFields}
            pkField="idtipotarea"
        />
    );
};

export default TiposTareaView;
