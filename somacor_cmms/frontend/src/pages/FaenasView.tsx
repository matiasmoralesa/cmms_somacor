import React from 'react';
import { GenericCRUD } from '@/components/shared/GenericCRUD';
import { ColumnDefinition, FormField } from '@/types';

interface Faena {
    idfaena: number;
    nombrefaena: string;
    ubicacion: string | null;
}

const columns: ColumnDefinition<Faena>[] = [
    { header: 'ID', accessor: 'idfaena' },
    { header: 'Nombre Faena', accessor: 'nombrefaena' },
    { header: 'Ubicación', accessor: 'ubicacion' },
];

const formFields: FormField<Faena>[] = [
    { name: 'nombrefaena', label: 'Nombre de la Faena', type: 'text' },
    { name: 'ubicacion', label: 'Ubicación', type: 'text' },
];

const FaenasView: React.FC = () => {
    return (
        <GenericCRUD<Faena>
            title="Gestión de Faenas"
            endpoint="faenas"
            columns={columns}
            formFields={formFields}
            pkField="idfaena"
        />
    );
};

export default FaenasView;
