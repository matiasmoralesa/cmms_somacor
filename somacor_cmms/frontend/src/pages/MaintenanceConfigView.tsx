import React from 'react';

const MaintenanceConfigView = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración de Mantenimiento</h1>
            <div className="bg-white p-8 rounded-xl shadow-md">
                <p className="text-gray-600">
                    Esta sección está en desarrollo. Aquí se podrán configurar los planes de mantenimiento
                    estándar para cada tipo de equipo, definir las tareas y las frecuencias (por horas o por días).
                </p>
            </div>
        </div>
    );
};

export default MaintenanceConfigView;
