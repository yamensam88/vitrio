"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COMMISSION_RATE } from "@/lib/supabase-service";
import { 
    secureGetGarage as getGarageById, 
    secureGetAppointments as getAppointmentsByGarage, 
    secureUpdateAppointmentStatus as updateAppointmentStatus, 
    secureGetAvailabilities as getGarageAvailabilities, 
    secureAddAvailability as addGarageAvailability, 
    secureDeleteAvailability as deleteGarageAvailability, 
    secureGetOffers as getOffersByGarage, 
    secureCreateOffer as createOffer, 
    secureUpdateOffer as updateOffer, 
    secureDeleteOffer as deleteOffer 
} from "@/app/pro/actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import type { Database } from "@/lib/supabase";

type Garage = Database['public']['Tables']['garages']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type GarageAvailability = Database['public']['Tables']['garage_availabilities']['Row'];
type Offer = Database['public']['Tables']['offers']['Row'];

export default function PartnerDashboard() {
    const router = useRouter();
    const [userGarage, setUserGarage] = useState<Garage | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availabilities, setAvailabilities] = useState<GarageAvailability[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [offerForm, setOfferForm] = useState({
        offerType: 'finance' as 'finance' | 'gift' | 'combined',
        customName: '',
        customValue: 0,
        combinedRefund: 0,
        combinedGiftValue: 0,
        // Legacy fields for backward compatibility/saving
        description: '',
        price: 0,
        currency: 'EUR',
        service_duration: 120
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const res = await fetch('/api/pro/me');
                if (!res.ok) {
                    router.push('/pro/login');
                    return;
                }
                const data = await res.json();
                loadGarageData(data.garage_id);
            } catch (err) {
                console.error(err);
                router.push('/pro/login');
            }
        }
        init();
    }, [router]);

    async function loadGarageData(garageId: string) {
        try {
            console.log("DEBUG: Loading garage data for id:", garageId);
            const garage = await getGarageById(garageId);
            console.log("DEBUG: Garage found:", garage?.id);

            if (!garage) {
                console.warn("DEBUG: No garage found for this id");
                setError("Session expirée ou introuvable. Redirection vers la page de connexion...");
                setTimeout(() => router.push('/pro/login'), 2000);
                return;
            }

            setUserGarage(garage);

            // Load appointments, availabilities, and offers in parallel
            console.log("DEBUG: Fetching appts, avs, and offers...");
            const [appts, avs, offersData] = await Promise.all([
                getAppointmentsByGarage(garage.id),
                getGarageAvailabilities(garage.id),
                getOffersByGarage(garage.id)
            ]);
            console.log("DEBUG: Data fetched successfully");
            setAppointments(appts);
            setAvailabilities(avs);
            setOffers(offersData || []);
        } catch (error: any) {
            console.error('CRITICAL ERROR loading garage data:', error);
            setError("Erreur de chargement des données. Veuillez vérifier votre connexion.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSlotToggle(date: Date, existingSlot?: GarageAvailability) {
        if (!userGarage) return;

        try {
            if (existingSlot) {
                // If it exists, we remove it (toggle off)
                await deleteGarageAvailability(Number(existingSlot.id), userGarage.id);
                setAvailabilities(prev => prev.filter(av => av.id !== existingSlot.id));
            } else {
                // If it doesn't exist, we add it (toggle on)
                const endTime = new Date(date.getTime() + 30 * 60 * 1000); // 30 min duration
                const newAv = await addGarageAvailability({
                    garage_id: userGarage.id,
                    start_time: date.toISOString(),
                    end_time: endTime.toISOString(),
                    is_available: true
                }, userGarage.id);
                setAvailabilities(prev => [...prev, newAv]);
            }
        } catch (error) {
            console.error('Error toggling slot:', error);
            alert("Erreur lors de la modification du créneau");
        }
    }

    async function handleToggleStatus(id: number, currentStatus: string) {
        try {
            const newStatus = currentStatus === "En attente" ? "Confirmé" : "Terminé";
            await updateAppointmentStatus(id, newStatus, userGarage!.id);

            // Reload appointments
            if (userGarage) {
                const appts = await getAppointmentsByGarage(userGarage.id);
                setAppointments(appts);
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    }



    async function handleLogout() {
        await fetch('/api/pro/logout', { method: 'POST' });
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
    const confirmedCount = appointments.filter(a => a.status === 'Confirmé' || a.status === 'Terminé').length;
    const commissions = confirmedCount * COMMISSION_RATE;

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ margin: 0 }}>Gestion de l&apos;Agenda</h1>
                            <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Cliquez sur les créneaux pour ouvrir ou fermer vos disponibilités.</p>
                        </div>
                    </div>

                    <TimeSlotPicker
                        mode="PARTNER"
                        appointments={appointments}
                        availabilities={availabilities}
                        onSlotClick={handleSlotToggle}
                    />
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>RDV Confirmés</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{confirmedCount}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Frais Vitrio (55€/rdv)</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{commissions} €</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Note Moyenne</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{userGarage.rating}<span style={{ fontSize: '1rem', color: '#94A3B8' }}>/5</span></div>
                    </div>
                </div>

                {/* Mes Offres Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Mes Offres</h2>
                        <button
                            onClick={() => {
                                setEditingOffer(null);
                                setOfferForm({
                                    offerType: 'finance',
                                    customName: '',
                                    customValue: 150,
                                    combinedRefund: 50,
                                    combinedGiftValue: 100,
                                    description: '',
                                    price: 150,
                                    currency: 'EUR',
                                    service_duration: 120
                                });
                                setIsOfferModalOpen(true);
                            }}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            + Ajouter une offre
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {offers.map(offer => (
                            <div key={offer.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Description</div>
                                    <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: '1.4' }}>{offer.description}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.1rem' }}>Valeur</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{offer.price}€</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => {
                                                setEditingOffer(offer);
                                                // Heuristic to set initial form state from existing data
                                                const isCombined = offer.description.includes(' + ');
                                                const isGift = !isCombined && !offer.description.includes('Franchise');

                                                setOfferForm({
                                                    offerType: isCombined ? 'combined' : isGift ? 'gift' : 'finance',
                                                    customName: '', // Hard to parse perfectly without structured data
                                                    customValue: offer.price,
                                                    combinedRefund: 0,
                                                    combinedGiftValue: 0,
                                                    description: offer.description,
                                                    price: offer.price,
                                                    currency: offer.currency,
                                                    service_duration: offer.service_duration
                                                });
                                                setIsOfferModalOpen(true);
                                            }}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                fontSize: '0.85rem',
                                                color: '#3b82f6',
                                                backgroundColor: '#eff6ff',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
                                                    try {
                                                        await deleteOffer(offer.id, userGarage!.id);
                                                        setOffers(prev => prev.filter(o => o.id !== offer.id));
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erreur lors de la suppression");
                                                    }
                                                }
                                            }}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                fontSize: '0.85rem',
                                                color: '#ef4444',
                                                backgroundColor: '#fef2f2',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {offers.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#64748b', backgroundColor: '#e2e8f0', borderRadius: '12px' }}>
                                Aucune offre active. Ajoutez-en une pour être visible !
                            </div>
                        )}
                    </div>
                </div>

                {/* Offer Modal */}
                {isOfferModalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '500px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                                {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre'}
                            </h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();

                                // Calculate Final Description & Price based on Type
                                let finalDesc = '';
                                let finalPrice = 0;

                                if (offerForm.offerType === 'finance') {
                                    finalPrice = offerForm.customValue;
                                    finalDesc = `Franchise offerte jusqu'à ${finalPrice}€`;
                                } else if (offerForm.offerType === 'gift') {
                                    finalPrice = offerForm.customValue;
                                    finalDesc = `${offerForm.customName} (${finalPrice}€)`;
                                } else {
                                    // Combined
                                    finalPrice = (offerForm.combinedRefund || 0) + (offerForm.combinedGiftValue || 0);
                                    finalDesc = `Franchise (${offerForm.combinedRefund}€) + ${offerForm.customName}`;
                                }

                                try {
                                    if (editingOffer) {
                                        const updated = await updateOffer(editingOffer.id, {
                                            description: finalDesc,
                                            price: finalPrice,
                                            currency: offerForm.currency,
                                            service_duration: offerForm.service_duration
                                        }, userGarage!.id);
                                        setOffers(prev => prev.map(o => o.id === updated.id ? updated : o));
                                    } else {
                                        const newOffer = await createOffer({
                                            garage_id: userGarage!.id,
                                            id: `offer_${Date.now()}`,
                                            description: finalDesc,
                                            price: finalPrice,
                                            currency: offerForm.currency,
                                            service_duration: offerForm.service_duration,
                                            availability: new Date().toISOString()
                                        }, userGarage!.id);
                                        setOffers(prev => [newOffer, ...prev]);
                                    }
                                    setIsOfferModalOpen(false);
                                } catch (err) {
                                    console.error(err);
                                    alert("Erreur lors de l'enregistrement");
                                }
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    {/* OFFER TYPE SELECTOR */}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setOfferForm(prev => ({ ...prev, offerType: 'finance' }))}
                                            style={{
                                                flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: offerForm.offerType === 'finance' ? '#0284C7' : '#E2E8F0',
                                                backgroundColor: offerForm.offerType === 'finance' ? '#E0F2FE' : 'white',
                                                color: offerForm.offerType === 'finance' ? '#0284C7' : '#64748B',
                                                fontWeight: 600
                                            }}
                                        >
                                            💰 Remboursement
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOfferForm(prev => ({ ...prev, offerType: 'gift' }))}
                                            style={{
                                                flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: offerForm.offerType === 'gift' ? '#0284C7' : '#E2E8F0',
                                                backgroundColor: offerForm.offerType === 'gift' ? '#E0F2FE' : 'white',
                                                color: offerForm.offerType === 'gift' ? '#0284C7' : '#64748B',
                                                fontWeight: 600
                                            }}
                                        >
                                            🎁 Cadeau
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOfferForm(prev => ({ ...prev, offerType: 'combined' }))}
                                            style={{
                                                flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: offerForm.offerType === 'combined' ? '#0284C7' : '#E2E8F0',
                                                backgroundColor: offerForm.offerType === 'combined' ? '#E0F2FE' : 'white',
                                                color: offerForm.offerType === 'combined' ? '#0284C7' : '#64748B',
                                                fontWeight: 600
                                            }}
                                        >
                                            ✨ Les deux
                                        </button>
                                    </div>

                                    {/* DYNAMIC FIELDS */}
                                    {offerForm.offerType === 'finance' ? (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Montant offert / Remboursé</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    required
                                                    type="number"
                                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                    value={offerForm.customValue}
                                                    onChange={e => setOfferForm({ ...offerForm, customValue: parseInt(e.target.value) || 0 })}
                                                    placeholder="100"
                                                />
                                                <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>
                                                Sera affiché comme : &quot;Franchise offerte jusqu&apos;à {offerForm.customValue}€&quot;
                                            </div>
                                        </div>
                                    ) : offerForm.offerType === 'gift' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Nature du Cadeau</label>
                                                <input
                                                    required
                                                    type="text"
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                    value={offerForm.customName}
                                                    onChange={e => setOfferForm({ ...offerForm, customName: e.target.value })}
                                                    placeholder="ex: Nintendo Switch Lite"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Valeur Estimée</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        required
                                                        type="number"
                                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                        value={offerForm.customValue}
                                                        onChange={e => setOfferForm({ ...offerForm, customValue: parseInt(e.target.value) || 0 })}
                                                        placeholder="200"
                                                    />
                                                    <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Montant Remboursé (Franchise)</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        required
                                                        type="number"
                                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                        value={offerForm.combinedRefund || 0}
                                                        onChange={e => setOfferForm({ ...offerForm, combinedRefund: parseInt(e.target.value) || 0 })}
                                                        placeholder="100"
                                                    />
                                                    <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Nature du Cadeau</label>
                                                <input
                                                    required
                                                    type="text"
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                    value={offerForm.customName}
                                                    onChange={e => setOfferForm({ ...offerForm, customName: e.target.value })}
                                                    placeholder="ex: Carte Carburant"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Valeur du Cadeau</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        required
                                                        type="number"
                                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                        value={offerForm.combinedGiftValue || 0}
                                                        onChange={e => setOfferForm({ ...offerForm, combinedGiftValue: parseInt(e.target.value) || 0 })}
                                                        placeholder="50"
                                                    />
                                                    <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', textAlign: 'right', marginTop: '0.5rem' }}>
                                                Valeur Totale affichée : {(offerForm.combinedRefund || 0) + (offerForm.combinedGiftValue || 0)} €
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'end', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsOfferModalOpen(false)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
                                            Terminé
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
