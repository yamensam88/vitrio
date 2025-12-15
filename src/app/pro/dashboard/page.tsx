"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, Appointment } from "@/context/AppContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default function PartnerDashboard() {
    const { appointments, updateAppointmentStatus, userGarage, logoutGarage, updateGarageAvailability } = useApp();
    const router = useRouter();
    const [availabilityInput, setAvailabilityInput] = useState("");

    // Protect Route
    useEffect(() => {
        if (!userGarage) {
            router.push('/pro/login');
        } else {
            // Initialize availability input
            setAvailabilityInput(userGarage.nextAvailability.split('T')[0]);
        }
    }, [userGarage, router]);

    if (!userGarage) return null; // Prevent flash

    const myAppointments = appointments.filter(a => a.garageId === userGarage.id);

    const toggleStatus = (id: number, currentStatus: Appointment['status']) => {
        if (currentStatus === "En attente") updateAppointmentStatus(id, "Confirmé");
        else if (currentStatus === "Confirmé") updateAppointmentStatus(id, "Terminé");
    };

    const handleUpdateAvailability = () => {
        const newDate = new Date(availabilityInput).toISOString();
        updateGarageAvailability(newDate);
        alert("Disponibilité mise à jour !");
    };

    // Calculate Stats
    const revenue = myAppointments
        .filter(a => a.status === 'Terminé' || (a.status === 'Confirmé' && a.billingTriggered))
        .reduce((acc, curr) => acc + curr.amount, 0);

    const confirmedCount = myAppointments.filter(a => a.status === 'Confirmé' || a.status === 'Terminé').length;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Top Bar */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{userGarage.name}</span>
                        <button onClick={logoutGarage} style={{ fontSize: '0.85rem', color: '#EF4444', textDecoration: 'underline' }}>Se déconnecter</button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0 }}>Tableau de Bord</h1>

                    {/* Availability Management */}
                    <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 0 }}>
                        <div style={{ fontSize: '0.9rem' }}>Prochaine dispo :</div>
                        <input
                            type="date"
                            className="input"
                            style={{ padding: '0.5rem' }}
                            value={availabilityInput}
                            onChange={(e) => setAvailabilityInput(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleUpdateAvailability} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            Mettre à jour
                        </button>
                    </div>
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
                        {myAppointments.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Aucun rendez-vous pour le moment.</div>
                        ) : myAppointments.map(app => (
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
                                        {app.clientName}
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
                                    {app.billingTriggered && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                                            ✓ Facturé
                                        </span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {app.status === 'En attente' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => toggleStatus(app.id, app.status)}
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
                                            onClick={() => toggleStatus(app.id, app.status)}
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
