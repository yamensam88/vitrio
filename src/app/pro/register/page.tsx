"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminGarage } from "@/lib/supabase-service";

export default function RegisterPro() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        siret: "",
        city: "",
        address: "",
        email: "",
        phone: "",
        offerType: 'finance' as 'finance' | 'gift',
        customName: "",
        customValue: 0,
        homeService: false,
        courtesyVehicle: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Logic to construct offer
            let description = "";
            let effectivePrice = 0;

            if (formData.offerType === 'finance') {
                description = `Franchise offerte (jusqu'à ${formData.customValue}€)`;
                effectivePrice = -formData.customValue;
            } else {
                description = `${formData.customName} Offert(e) (Val. ${formData.customValue}€)`;
                effectivePrice = -formData.customValue;
            }

            // Create admin garage in Supabase
            await createAdminGarage({
                name: formData.name,
                city: formData.city,
                address: formData.address,
                email: formData.email,
                phone: formData.phone,
                siret: formData.siret,
                status: 'En attente',
                registration_date: new Date().toISOString().split('T')[0],
                garage_id: null,
                generated_code: null,
                offer_value: formData.customValue,
                offer_description: formData.offerType === 'finance'
                    ? `Franchise offerte (jusqu'à ${formData.customValue}€)`
                    : `${formData.customName} Offert(e) (Val. ${formData.customValue}€)`,
                home_service: formData.homeService,
                courtesy_vehicle: formData.courtesyVehicle,
                franchise_offerte: formData.offerType === 'finance'
            });

            alert('Inscription envoyée ! Vous recevrez un email avec votre code d\'accès une fois validé par l\'admin.');
            router.push('/pro');
        } catch (error: any) {
            console.error('Full registration error object:', error);
            alert(`Erreur lors de l'inscription: ${error?.message || 'Veuillez réessayer.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <nav className="container" style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></Link>
                <Link href="/pro" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>&larr; Retour</Link>
            </nav>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                        Rejoignez le réseau Vitrio
                    </h1>
                    <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Inscription gratuite et sans engagement.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nom du Garage</label>
                            <input
                                required
                                type="text"
                                className="input-field"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ex: AutoGlass Paris"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Numéro SIRET</label>
                            <input
                                required
                                type="text"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                value={formData.siret}
                                onChange={e => setFormData({ ...formData, siret: e.target.value })}
                                placeholder="123 456 789 00012"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Adresse complète</label>
                                <input
                                    required
                                    type="text"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="ex: 123 rue de Rivoli, 75001 Paris"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Ville</label>
                                <input
                                    required
                                    type="text"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Paris"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Téléphone</label>
                                <input
                                    required
                                    type="tel"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="01 23 45 67 89"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email Professionnel</label>
                            <input
                                required
                                type="email"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@garage.com"
                            />
                        </div>

                        {/* OFFER SECTION */}
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0369A1' }}>Votre Offre Vitrio</h3>

                            {/* Toggle Type */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, offerType: 'finance' }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: formData.offerType === 'finance' ? '#0284C7' : '#E2E8F0',
                                        backgroundColor: formData.offerType === 'finance' ? '#E0F2FE' : 'white',
                                        color: formData.offerType === 'finance' ? '#0284C7' : '#64748B',
                                        fontWeight: 600
                                    }}
                                >
                                    💰 Remboursement
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, offerType: 'gift' }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: formData.offerType === 'gift' ? '#0284C7' : '#E2E8F0',
                                        backgroundColor: formData.offerType === 'gift' ? '#E0F2FE' : 'white',
                                        color: formData.offerType === 'gift' ? '#0284C7' : '#64748B',
                                        fontWeight: 600
                                    }}
                                >
                                    🎁 Cadeau
                                </button>
                            </div>

                            {formData.offerType === 'finance' ? (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Montant offert / Remboursé</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            required
                                            type="number"
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                            value={formData.customValue}
                                            onChange={e => setFormData({ ...formData, customValue: parseInt(e.target.value) || 0 })}
                                            placeholder="100"
                                        />
                                        <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>
                                        Sera affiché comme : "Franchise offerte jusqu'à {formData.customValue}€"
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Nature du Cadeau</label>
                                        <input
                                            required
                                            type="text"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                            value={formData.customName}
                                            onChange={e => setFormData({ ...formData, customName: e.target.value })}
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
                                                value={formData.customValue}
                                                onChange={e => setFormData({ ...formData, customValue: parseInt(e.target.value) || 0 })}
                                                placeholder="200"
                                            />
                                            <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Services Section */}
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#166534' }}>Services Proposés</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.homeService}
                                        onChange={e => setFormData({ ...formData, homeService: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: '#166534' }}>🏠 Intervention à domicile ou sur le lieu de travail</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.courtesyVehicle}
                                        onChange={e => setFormData({ ...formData, courtesyVehicle: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: '#166534' }}>🚗 Véhicule de courtoisie disponible</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem', padding: '1rem', width: '100%', justifyContent: 'center' }}
                        >
                            {loading ? 'Création en cours...' : 'Valider mon inscription'}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        En cliquant sur valider, vous acceptez nos CGU Partenaires.
                    </p>
                </div>
            </div>
        </div>
    );
}
