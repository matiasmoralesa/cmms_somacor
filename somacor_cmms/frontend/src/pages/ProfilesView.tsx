import React from 'react';
import { GenericCRUD } from '@/components/shared/GenericCRUD';
import { ColumnDefinition, FormField } from '@/types';

interface Profile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    perfil: {
        idrol: {
            idrol: number;
            nombrerol: string;
        };
        idespecialidad: {
            idespecialidad: number;
            nombreespecialidad: string;
        } | null;
    } | null;
}

const columns: ColumnDefinition<Profile>[] = [
    { header: 'Username', accessor: 'username' },
    { header: 'Nombre', accessor: (item) => `${item.first_name} ${item.last_name}` },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: (item) => item.perfil?.idrol?.nombrerol || 'Sin rol' },
];

const formFields: FormField<Profile>[] = [
    { name: 'username', label: 'Nombre de usuario', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'first_name', label: 'Nombre', type: 'text' },
    { name: 'last_name', label: 'Apellido', type: 'text' },
];

const ProfilesView: React.FC = () => {
    return (
        <GenericCRUD<Profile>
            title="Gestión de Perfiles"
            endpoint="users"
            columns={columns}
            formFields={formFields}
            pkField="id"
        />
    );
};

export default ProfilesView;
