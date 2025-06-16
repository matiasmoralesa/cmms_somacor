import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';

import Modal from '@/components/ui/Modal'; 
import apiClient from '@/api/apiClient';
import { Trash2, Edit } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => {
    // Componente visual para cada evento en el calendario
    const eventTypeClasses = {
        preventivo: 'bg-blue-500 hover:bg-blue-600',
        correctivo: 'bg-orange-500 hover:bg-orange-600',
        inspeccion: 'bg-teal-500 hover:bg-teal-600',
        general: 'bg-gray-500 hover:bg-gray-600',
    };
    const baseClasses = 'p-1 text-white rounded-lg text-xs truncate transition-colors h-full flex items-center';
    const eventClasses = `${baseClasses} ${eventTypeClasses[event.type] || eventTypeClasses.general}`;
    return <div className={eventClasses}><span>{event.title}</span></div>;
};

const EventForm = ({ event, slot, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        start: '',
        end: '',
        type: 'general',
        notes: '',
    });

    useEffect(() => {
        const initialStart = event?.start || slot?.start;
        const initialEnd = event?.end || slot?.end;
        setFormData({
            title: event?.title || '',
            start: moment(initialStart).format('YYYY-MM-DDTHH:mm'),
            end: moment(initialEnd).format('YYYY-MM-DDTHH:mm'),
            type: event?.type || 'general',
            notes: event?.notes || '',
        });
    }, [event, slot]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: event?.id, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Título</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div><label>Tipo</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="mt-1 w-full p-2 border rounded-md"><option value="general">General</option><option value="preventivo">Preventivo</option><option value="correctivo">Correctivo</option><option value="inspeccion">Inspección</option></select></div>
            <div><label>Notas</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
            <div><label>Inicio</label><input type="datetime-local" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div><label>Fin</label><input type="datetime-local" value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required /></div>
            <div className="flex justify-end pt-4 space-x-3"><button type="button" onClick={onCancel}>Cancelar</button><button type="submit">Guardar</button></div>
        </form>
    );
};

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, mode: null, data: null });
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/agendas/');
            const formattedEvents = response.data.map(event => ({
                id: event.id,
                title: event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                type: event.type,
                notes: event.notes,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("No se pudieron cargar los eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectSlot = useCallback((slotInfo) => {
        if (slotInfo.action === 'click' && slotInfo.slots.length <= 1) return;
        setModalState({ isOpen: true, mode: 'create', data: { slot: slotInfo } });
    }, []);

    const handleSelectEvent = useCallback((event) => {
        setModalState({ isOpen: true, mode: 'view', data: { event } });
    }, []);
    
    const handleSaveEvent = useCallback(async (eventData) => {
        const payload = {
            tituloevento: eventData.title,
            fechahorainicio: moment(eventData.start).toISOString(),
            fechahorafin: moment(eventData.end).toISOString(),
            tipoevento: eventData.type,
            descripcionevento: eventData.notes,
        };

        try {
            if (modalState.mode === 'create') {
                await apiClient.post('/agendas/', payload);
                toast.success("Evento creado con éxito.");
            } else if (modalState.mode === 'edit') {
                await apiClient.put(`/agendas/${eventData.id}/`, payload);
                toast.success("Evento actualizado con éxito.");
            }
            setModalState({ isOpen: false, mode: null, data: null });
            fetchEvents();
        } catch (error) {
            toast.error("No se pudo guardar el evento.");
        }
    }, [modalState.mode, fetchEvents]);
    
    const handleDeleteEvent = useCallback(async (eventId) => {
        // Aquí se podría integrar un modal de confirmación
        if (window.confirm("¿Está seguro de que desea eliminar este evento?")) {
            try {
                await apiClient.delete(`/agendas/${eventId}/`);
                toast.success("Evento eliminado con éxito.");
                setModalState({ isOpen: false, mode: null, data: null });
                fetchEvents();
            } catch (error) {
                toast.error("No se pudo eliminar el evento.");
            }
        }
    }, [fetchEvents]);
    
    const renderModalContent = () => {
        const { mode, data } = modalState;
        if (mode === 'create' || mode === 'edit') {
            return <EventForm event={data?.event} slot={data?.slot} onSave={handleSaveEvent} onCancel={() => setModalState({ isOpen: false, mode: null, data: null })} />;
        }
        if (mode === 'view' && data?.event) {
            return (
                <div className="space-y-4">
                    <p><strong className="text-gray-600">Tipo:</strong> <span className="capitalize">{data.event.type}</span></p>
                    <p><strong className="text-gray-600">Desde:</strong> {moment(data.event.start).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong className="text-gray-600">Hasta:</strong> {moment(data.event.end).format('DD/MM/YYYY HH:mm')}</p>
                    {data.event.notes && <p><strong className="text-gray-600">Notas:</strong> {data.event.notes}</p>}
                    <div className="flex justify-end pt-4 space-x-3">
                        <button onClick={() => handleDeleteEvent(data.event.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"><Trash2 size={16} className="mr-2"/>Eliminar</button>
                        <button onClick={() => setModalState({ ...modalState, mode: 'edit' })} className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-600"><Edit size={16} className="mr-2"/>Editar</button>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="p-6">Cargando calendario...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Calendario de Mantenimiento</h1>
            <div className="bg-white p-6 rounded-xl shadow-md h-[75vh]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    components={{ event: CustomEvent }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    defaultView={Views.MONTH}
                    messages={{
                      next: "Sig",
                      previous: "Ant",
                      today: "Hoy",
                      month: "Mes",
                      week: "Semana",
                      day: "Día",
                    }}
                />
            </div>
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({isOpen: false, mode: null, data: null})} title={"Gestionar Evento"}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default CalendarView;
