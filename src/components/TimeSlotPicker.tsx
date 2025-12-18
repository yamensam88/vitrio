"use client";

import { useState, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

interface TimeSlot {
    id?: string;
    start_time: string;
    is_available: boolean;
    appointment?: any; // If slot is taken
}

interface TimeSlotPickerProps {
    mode: "CUSTOMER" | "PARTNER";
    availabilities: any[];
    appointments: any[];
    onSlotClick: (date: Date, existingSlot?: any) => void;
    selectedDate?: Date | null;
}

const HOURS = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start at 8:00
    const minute = i % 2 === 0 ? 0 : 30;
    return { hour, minute };
});

export default function TimeSlotPicker({ mode, availabilities, appointments, onSlotClick, selectedDate }: TimeSlotPickerProps) {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    const nextWeek = () => setWeekStart(addDays(weekStart, 7));
    const prevWeek = () => setWeekStart(addDays(weekStart, -7));

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    {format(weekStart, 'MMMM yyyy', { locale: fr }).toUpperCase()}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevWeek} className="btn" style={{ padding: '0.4rem', backgroundColor: '#f8fafc' }}><ChevronLeft size={18} /></button>
                    <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="btn" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f8fafc', fontSize: '0.8rem' }}>Semaine en cours</button>
                    <button onClick={nextWeek} className="btn" style={{ padding: '0.4rem' }}><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '700px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc' }}>
                    {days.map(day => (
                        <div key={day.toISOString()} style={{ padding: '1rem 0.5rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>{format(day, 'EEEE', { locale: fr })}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{format(day, 'd MMM')}</div>
                        </div>
                    ))}
                </div>

                <div style={{ minWidth: '700px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', maxHeight: '400px', overflowY: 'auto' }}>
                    {days.map(day => {
                        return (
                            <div key={day.toISOString()} style={{ borderRight: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                                {HOURS.map(({ hour, minute }) => {
                                    const slotDate = setHours(setMinutes(day, minute), hour);
                                    const isPast = slotDate < new Date();

                                    const existingAvailability = availabilities.find(av => isSameDay(parseISO(av.start_time), day) && parseISO(av.start_time).getHours() === hour && parseISO(av.start_time).getMinutes() === minute);
                                    const existingAppointment = appointments.find(app => isSameDay(parseISO(app.date), day) && parseISO(app.date).getHours() === hour && parseISO(app.date).getMinutes() === minute);

                                    let status: "EMPTY" | "AVAILABLE" | "BOOKED" = "EMPTY";
                                    if (existingAppointment) status = "BOOKED";
                                    else if (existingAvailability) status = "AVAILABLE";

                                    const isSelected = selectedDate && Math.abs(selectedDate.getTime() - slotDate.getTime()) < 1000;

                                    return (
                                        <button
                                            key={`${hour}:${minute}`}
                                            disabled={isPast && mode === "CUSTOMER"}
                                            onClick={() => !isPast && onSlotClick(slotDate, existingAvailability)}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.25rem',
                                                border: 'none',
                                                borderBottom: '1px solid #f1f5f9',
                                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                color: isSelected ? 'white' : 'inherit',
                                                cursor: isPast && mode === "CUSTOMER" ? 'not-allowed' : 'pointer',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '2px',
                                                transition: 'all 0.15s',
                                                filter: isPast && mode === "CUSTOMER" ? 'grayscale(1) opacity(0.4)' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}</span>

                                            {mode === "PARTNER" ? (
                                                status === "BOOKED" ? (
                                                    <span style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 700 }}>RESERVE</span>
                                                ) : status === "AVAILABLE" ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#3b82f6', fontSize: '0.6rem' }}>
                                                        <Check size={8} strokeWidth={4} /> ACTIF
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#cbd5e1', fontSize: '0.6rem' }}>-</span>
                                                )
                                            ) : (
                                                status === "AVAILABLE" ? (
                                                    <span style={{ color: isSelected ? 'white' : '#16a34a', fontWeight: 700, fontSize: '0.6rem' }}>LIBRE</span>
                                                ) : status === "BOOKED" ? (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.6rem' }}>OCCUPÉ</span>
                                                ) : (
                                                    <span style={{ color: '#e2e8f0', fontSize: '0.6rem' }}>-</span>
                                                )
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
