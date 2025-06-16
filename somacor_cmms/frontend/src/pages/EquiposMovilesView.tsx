import React from 'react';
import { GenericCRUD } from '@/components/shared/GenericCRUD';
import { ColumnDefinition, FormField } from '@/types';

interface Equipo {
    idequipo: number;
    codigoequipo: string;
    descripcion: string;
    horometroactual: number | null;
    idfaena: number;
    nombrefaena: string;
    idtipoequipo: number;
    nombretipoequipo: string;
    idestatus: number;
    nombreestado: string;
}

const columns: ColumnDefinition<Equipo>[] = [
    { header: 'Código', accessor: 'codigoequipo' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Faena', accessor: 'nombrefaena' },
    { header: 'Tipo', accessor: 'nombretipoequipo' },
    { header: 'Estado', accessor: 'nombreestado' },
    { header: 'Horómetro', accessor: 'horometroactual' },
];

const formFields: FormField<Equipo>[] = [
    { name: 'codigoequipo', label: 'Código del Equipo', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    {
        name: 'idfaena',
        label: 'Faena',
        type: 'select',
        optionsSource: {
            endpoint: 'faenas',
            valueField: 'idfaena',
            labelField: 'nombrefaena',
        },
    },
    {
        name: 'idtipoequipo',
        label: 'Tipo de Equipo',
        type: 'select',
        optionsSource: {
            endpoint: 'tipos-equipo',
            valueField: 'idtipoequipo',
            labelField: 'nombretipo',
        },
    },
    {
        name: 'idestatus',
        label: 'Estado',
        type: 'select',
        optionsSource: {
            endpoint: 'estados-equipo',
            valueField: 'idestatus',
            labelField: 'nombreestado',
        },
    },
    { name: 'horometroactual', label: 'Horómetro Actual', type: 'number' },
];

const EquiposMovilesView: React.FC = () => {
    return (
        <GenericCRUD<Equipo>
            title="Gestión de Equipos Móviles"
            endpoint="equipos"
            columns={columns}
            formFields={formFields}
            pkField="idequipo"
        />
    );
};

export default EquiposMovilesView;
