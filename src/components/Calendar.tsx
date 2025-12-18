"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarProps {
    appointments: any[];
    availabilities: any[];
    onAddAvailability: (date: Date) => void;
    onDeleteAvailability: (id: string) => void;
}

export default function Calendar({ appointments, availabilities, onAddAvailability, onDeleteAvailability }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, textTransform: 'capitalize' }}>
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} className="btn" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f1f5f9' }}>←</button>
                    <button onClick={() => setCurrentMonth(new Date())} className="btn" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f1f5f9' }}>Aujourd'hui</button>
                    <button onClick={nextMonth} className="btn" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f1f5f9' }}>→</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} style={{ backgroundColor: '#f8fafc', padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>
                        {day}
                    </div>
                ))}

                {days.map((day, i) => {
                    const dayAppointments = appointments.filter(app => isSameDay(new Date(app.date), day));
                    const dayAvailabilities = availabilities.filter(av => isSameDay(new Date(av.start_time), day));
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                    return (
                        <div
                            key={i}
                            onClick={() => onAddAvailability(day)}
                            style={{
                                backgroundColor: 'white',
                                minHeight: '120px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                opacity: isCurrentMonth ? 1 : 0.4,
                                transition: 'background-color 0.2s',
                                border: isToday(day) ? '2px solid #ef4444' : 'none',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                        >
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: isToday(day) ? 700 : 400, color: isToday(day) ? '#ef4444' : '#64748b', marginBottom: '0.5rem' }}>
                                {format(day, 'd')}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {/* Appointments */}
                                {dayAppointments.map(app => (
                                    <div key={app.id} style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        backgroundColor: app.status === 'Confirmé' ? '#dcfce7' : '#fef9c3',
                                        color: app.status === 'Confirmé' ? '#166534' : '#854d0e',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        🕒 {format(new Date(app.date), 'HH:mm')} - {app.client_name}
                                    </div>
                                ))}

                                {/* Open Slots */}
                                {dayAvailabilities.map(av => (
                                    <div key={av.id} onClick={(e) => { e.stopPropagation(); onDeleteAvailability(av.id); }} style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        backgroundColor: '#dbeafe',
                                        color: '#1e40af',
                                        borderRadius: '4px',
                                        border: '1px dashed #3b82f6',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>Dispo: {format(new Date(av.start_time), 'HH:mm')}</span>
                                        <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>×</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#fef9c3', borderRadius: '3px' }}></div> En attente
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#dcfce7', borderRadius: '3px' }}></div> Confirmé
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#dbeafe', borderRadius: '3px', border: '1px dashed #3b82f6' }}></div> Créneau ouvert
                </div>
            </div>
        </div>
    );
}
