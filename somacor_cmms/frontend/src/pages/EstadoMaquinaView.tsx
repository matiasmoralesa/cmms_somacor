import React from 'react';
import { GenericCRUD } from '../shared/GenericCRUD.tsx';
import { ColumnDefinition, FormField } from '../types/index.ts';

interface EstadoEquipo {
    idestatus: number;
    nombreestado: string;
    descripcion: string | null;
}

const columns: ColumnDefinition<EstadoEquipo>[] = [
    { header: 'ID', accessor: 'idestatus' },
    { header: 'Nombre del Estado', accessor: 'nombreestado' },
    { header: 'Descripción', accessor: 'descripcion' },
];

const formFields: FormField<EstadoEquipo>[] = [
    { name: 'nombreestado', label: 'Nombre del Estado', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

const EstadoMaquinaView: React.FC = () => {
    return (
        <GenericCRUD<EstadoEquipo>
            title="Gestión de Estados de Equipo"
            endpoint="estados-equipo"
            columns={columns}
            formFields={formFields}
            pkField="idestatus"
        />
    );
};

export default EstadoMaquinaView;
