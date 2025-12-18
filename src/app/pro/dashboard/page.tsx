"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGarageByAccessCode, getAppointmentsByGarage, updateAppointmentStatus, updateGarageAvailability, getGarageAvailabilities, addGarageAvailability, deleteGarageAvailability } from "@/lib/supabase-service";
import type { Database } from "@/lib/supabase";
import { format, setHours, setMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import TimeSlotPicker from "@/components/TimeSlotPicker";

type Garage = Database['public']['Tables']['garages']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

export default function PartnerDashboard() {
    const router = useRouter();
    const [userGarage, setUserGarage] = useState<Garage | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if logged in (code in localStorage)
        const code = localStorage.getItem('partner_access_code');
        if (!code) {
            router.push('/pro/login');
            return;
        }

        loadGarageData(code);
    }, [router]);

    async function loadGarageData(code: string) {
        try {
            console.log("DEBUG: Loading garage data for code:", code);
            const garage = await getGarageByAccessCode(code);
            console.log("DEBUG: Garage found:", garage?.id);

            if (!garage) {
                console.warn("DEBUG: No garage found for this code");
                setError("Session expirée ou code invalide. Redirection vers la page de connexion...");
                localStorage.removeItem('partner_access_code');
                setTimeout(() => router.push('/pro/login'), 2000);
                return;
            }

            setUserGarage(garage);

            // Load appointments and availabilities in parallel
            console.log("DEBUG: Fetching appts and avs...");
            const [appts, avs] = await Promise.all([
                getAppointmentsByGarage(garage.id),
                getGarageAvailabilities(garage.id)
            ]);
            console.log("DEBUG: Data fetched successfully");
            setAppointments(appts);
            setAvailabilities(avs);
        } catch (error: any) {
            console.error('CRITICAL ERROR loading garage data:', error);
            setError("Erreur de chargement des données. Veuillez vérifier votre connexion.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddAvailability(date: Date) {
        if (!userGarage) return;

        const timeStr = prompt("Heure du créneau (ex: 09:00) :", "09:00");
        if (!timeStr) return;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = setHours(setMinutes(date, minutes || 0), hours || 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1h default

        try {
            await addGarageAvailability({
                garage_id: userGarage.id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                is_available: true
            });

            // Refresh
            const avs = await getGarageAvailabilities(userGarage.id);
            setAvailabilities(avs);
        } catch (error) {
            console.error('Error adding availability:', error);
            alert("Erreur lors de l'ajout");
        }
    }

    async function handleDeleteAvailability(id: string) {
        if (!confirm("Supprimer ce créneau ?")) return;
        try {
            await deleteGarageAvailability(id);
            setAvailabilities(prev => prev.filter(av => av.id !== id));
        } catch (error) {
            console.error('Error deleting availability:', error);
        }
    }

    async function handleToggleStatus(id: number, currentStatus: string) {
        try {
            const newStatus = currentStatus === "En attente" ? "Confirmé" : "Terminé";
            await updateAppointmentStatus(id, newStatus);

            // Reload appointments
            if (userGarage) {
                const appts = await getAppointmentsByGarage(userGarage.id);
                setAppointments(appts);
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    }



    function handleLogout() {
        localStorage.removeItem('partner_access_code');
        router.push('/pro/login');
    }

    if (loading || !userGarage) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div>Chargement...</div>
                {error && <div style={{ color: '#EF4444', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
            </div>
        );
    }

    // Calculate Stats
    const revenue = appointments
        .filter(a => a.status === 'Terminé' || (a.status === 'Confirmé' && a.billing_triggered))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const confirmedCount = appointments.filter(a => a.status === 'Confirmé' || a.status === 'Terminé').length;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Top Bar */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{userGarage.name}</span>
                        <button onClick={handleLogout} style={{ fontSize: '0.85rem', color: '#EF4444', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Se déconnecter</button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '1.5rem' }}>Tableau de Bord</h1>

                    {/* New Calendar System */}
                    <Calendar
                        appointments={appointments}
                        availabilities={availabilities}
                        onAddAvailability={handleAddAvailability}
                        onDeleteAvailability={handleDeleteAvailability}
                    />
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Facturé</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{revenue} €</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>RDV Confirmés</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{confirmedCount}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Note Moyenne</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{userGarage.rating}<span style={{ fontSize: '1rem', color: '#94A3B8' }}>/5</span></div>
                    </div>
                </div>

                {/* Appointments */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Vos Rendez-vous</h2>
                    </div>
                    <div>
                        {appointments.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Aucun rendez-vous pour le moment.</div>
                        ) : appointments.map(app => (
                            <div key={app.id} style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                padding: '1.5rem',
                                borderBottom: '1px solid #F1F5F9',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div>
                                    {/* MASKING LOGIC */}
                                    <div style={{
                                        fontWeight: 600,
                                        color: app.status === 'En attente' ? '#64748B' : 'inherit',
                                        filter: app.status === 'En attente' ? 'blur(4px)' : 'none',
                                        userSelect: app.status === 'En attente' ? 'none' : 'auto',
                                        transition: 'filter 0.3s ease'
                                    }}>
                                        {app.client_name}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                        {app.status === 'En attente' ? (
                                            <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                                Infos masquées avant confirmation
                                            </div>
                                        ) : (
                                            <>
                                                <div>Ref: VTR-{app.id}</div>
                                                <div>{app.phone}</div>
                                                <div>{app.email}</div>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                        {app.vehicle} • <span style={{ fontWeight: 500 }}>{app.offers[0]}</span>
                                    </div>
                                </div>

                                <div style={{ color: 'var(--color-text-main)' }}>
                                    {format(new Date(app.date), "dd MMM yyyy à HH:mm", { locale: fr })}
                                </div>

                                <div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        backgroundColor: app.status === 'En attente' ? '#FEF9C3' : app.status === 'Confirmé' ? '#E0F2FE' : '#DCFCE7',
                                        color: app.status === 'En attente' ? '#854D0E' : app.status === 'Confirmé' ? '#0369A1' : '#166534',
                                        display: 'inline-block'
                                    }}>
                                        {app.status}
                                    </span>
                                    {app.billing_triggered && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                                            ✓ Facturé
                                        </span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {app.status === 'En attente' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleToggleStatus(app.id, app.status)}
                                                className="btn"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.9rem',
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white'
                                                }}
                                            >
                                                Accepter & Voir ({app.amount}€)
                                            </button>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Déclenche la facturation</span>
                                        </div>
                                    )}
                                    {app.status === 'Confirmé' && (
                                        <button
                                            onClick={() => handleToggleStatus(app.id, app.status)}
                                            className="btn"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                backgroundColor: 'var(--color-secondary)',
                                                color: 'white'
                                            }}
                                        >
                                            Marquer Terminé
                                        </button>
                                    )}
                                    {app.status === 'Terminé' && (
                                        <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1.2rem' }}>
                                            +{app.amount} €
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
