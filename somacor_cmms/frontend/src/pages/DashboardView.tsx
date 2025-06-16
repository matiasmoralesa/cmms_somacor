import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import apiClient from '@/api/apiClient';
import { Users, Truck, Wrench, Building } from 'lucide-react';

const DashboardView = () => {
    // Datos dinámicos del estado
    const [summary, setSummary] = useState({ users: 0, equipos: 0, ordenes: 0, faenas: 0 });
    const [maintenanceDistribution, setMaintenanceDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Realizar todas las peticiones en paralelo
                const [usersRes, equiposRes, ordenesRes, faenasRes] = await Promise.all([
                    apiClient.get('/users/'),
                    apiClient.get('/equipos/'),
                    apiClient.get('/ordenes-trabajo/'),
                    apiClient.get('/faenas/')
                ]);

                // Actualizar resumen
                setSummary({
                    users: usersRes.data.length,
                    equipos: equiposRes.data.length,
                    ordenes: ordenesRes.data.filter(ot => ot.nombreestado !== 'Cerrada').length,
                    faenas: faenasRes.data.length,
                });

                // Calcular distribución de mantenimiento
                const preventivoCount = ordenesRes.data.filter(ot => ot.nombretipomantenimiento?.toLowerCase().includes('preventivo')).length;
                const correctivoCount = ordenesRes.data.filter(ot => ot.nombretipomantenimiento?.toLowerCase().includes('correctivo')).length;
                
                setMaintenanceDistribution([
                    { name: 'Preventivo', value: preventivoCount },
                    { name: 'Correctivo', value: correctivoCount },
                ]);

            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#FF8042'];

    if (loading) {
        return <div className="p-6">Cargando dashboard...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard General</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
                <Card title="Total de Usuarios" value={summary.users.toString()} icon={<Users className="text-white" />} color="bg-blue-500" />
                <Card title="Equipos Activos" value={summary.equipos.toString()} icon={<Truck className="text-white" />} color="bg-green-500" />
                <Card title="Órdenes Abiertas" value={summary.ordenes.toString()} icon={<Wrench className="text-white" />} color="bg-yellow-500" />
                <Card title="Faenas Operativas" value={summary.faenas.toString()} icon={<Building className="text-white" />} color="bg-indigo-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Mantenimiento (Dummy)</h2>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={[{name: 'Total', Preventivos: maintenanceDistribution[0]?.value || 0, Correctivos: maintenanceDistribution[1]?.value || 0}]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Preventivos" fill="#8884d8" /><Bar dataKey="Correctivos" fill="#82ca9d" /></BarChart></ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Distribución de Mantenimiento</h2>
                     <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={maintenanceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>{maintenanceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
