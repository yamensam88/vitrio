"use client";

import { useApp, Appointment } from "@/context/AppContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PartnerDashboard() {
    const { appointments, updateAppointmentStatus } = useApp();

    const toggleStatus = (id: number, currentStatus: Appointment['status']) => {
        if (currentStatus === "En attente") updateAppointmentStatus(id, "Confirmé");
        else if (currentStatus === "Confirmé") updateAppointmentStatus(id, "Terminé");
    };

    // Calculate Stats dynamically
    const revenue = appointments
        .filter(a => a.status === 'Terminé')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const confirmedCount = appointments.filter(a => a.status === 'Confirmé' || a.status === 'Terminé').length;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Top Bar */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>AutoGlass Paris 12</span>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#CBD5E1' }}></div>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '2rem 1rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Tableau de Bord</h1>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Chiffre d'affaires</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{revenue} €</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>RDV Confirmés</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{confirmedCount}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Note Moyenne</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>4.8<span style={{ fontSize: '1rem', color: '#94A3B8' }}>/5</span></div>
                    </div>
                </div>

                {/* Appointments */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Prochains Rendez-vous</h2>
                    </div>
                    <div>
                        {appointments.map(app => (
                            <div key={app.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 2fr 1fr',
                                padding: '1.5rem',
                                borderBottom: '1px solid #F1F5F9',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div>
                                    {/* MASKING LOGIC */}
                                    <div style={{ fontWeight: 600, color: app.status === 'En attente' ? '#64748B' : 'inherit' }}>
                                        {app.status === 'En attente' ? 'Client : ******' : app.clientName}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                        {app.status === 'En attente' ? (
                                            <>
                                                <div>Ref RDV : <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>VTR-9F2K{app.id}</span></div>
                                                <div>Tél : ** ** ** ** **</div>
                                                <div>Email : ******@******.**</div>
                                            </>
                                        ) : (
                                            <>
                                                <div>Ref RDV : VTR-9F2K{app.id}</div>
                                                <div>{app.phone}</div>
                                                <div>{app.email}</div>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                        {app.vehicle}
                                    </div>
                                </div>
                                <div style={{ color: 'var(--color-text-main)' }}>
                                    {format(new Date(app.date), "dd MMM HH:mm", { locale: fr })}
                                </div>
                                <div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        backgroundColor: app.status === 'En attente' ? '#FEF9C3' : app.status === 'Confirmé' ? '#E0F2FE' : '#DCFCE7',
                                        color: app.status === 'En attente' ? '#854D0E' : app.status === 'Confirmé' ? '#0369A1' : '#166534'
                                    }}>
                                        {app.status}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {app.status !== 'Terminé' && (
                                        <button
                                            onClick={() => toggleStatus(app.id, app.status)}
                                            className="btn"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                backgroundColor: app.status === 'En attente' ? 'var(--color-primary)' : 'var(--color-secondary)',
                                                color: 'white'
                                            }}
                                        >
                                            {app.status === 'En attente' ? 'Confirmer le RDV' : 'Terminer'}
                                        </button>
                                    )}
                                    {app.status === 'Terminé' && (
                                        <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>{app.amount}€</span>
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
