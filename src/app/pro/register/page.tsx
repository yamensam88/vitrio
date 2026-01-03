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
        offerType: 'finance' as 'finance' | 'gift' | 'combined',
        customName: "",
        customValue: 0,
        combinedRefund: 0,
        combinedGiftValue: 0,
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
                effectivePrice = formData.customValue;
            } else if (formData.offerType === 'combined') {
                // Combined: Refund + Gift
                const refund = formData.combinedRefund || 0;
                const giftVal = formData.combinedGiftValue || 0;
                const giftName = formData.customName || 'Cadeau';
                description = `Franchise (${refund}€) + ${giftName}`;
                effectivePrice = refund + giftVal;
            } else {
                description = `${formData.customName} Offert(e) (Val. ${formData.customValue}€)`;
                effectivePrice = formData.customValue;
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
                offer_value: effectivePrice,
                offer_description: description,
                home_service: formData.homeService,
                courtesy_vehicle: formData.courtesyVehicle,
                franchise_offerte: formData.offerType === 'finance' || formData.offerType === 'combined'
            });

            // NOTIFICATION: Send Email to Admin
            await fetch('/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin_alert_new_partner',
                    payload: {
                        name: formData.name,
                        city: formData.city,
                        email: formData.email,
                        phone: formData.phone
                    }
                })
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
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, offerType: 'combined' }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: formData.offerType === 'combined' ? '#0284C7' : '#E2E8F0',
                                        backgroundColor: formData.offerType === 'combined' ? '#E0F2FE' : 'white',
                                        color: formData.offerType === 'combined' ? '#0284C7' : '#64748B',
                                        fontWeight: 600
                                    }}
                                >
                                    ✨ Les deux
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
                            ) : formData.offerType === 'gift' ? (
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
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Montant Remboursé (Franchise)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                required
                                                type="number"
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                value={formData.combinedRefund || 0}
                                                onChange={e => setFormData({ ...formData, combinedRefund: parseInt(e.target.value) || 0 })}
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
                                            value={formData.customName}
                                            onChange={e => setFormData({ ...formData, customName: e.target.value })}
                                            placeholder="ex: Carte Carburant, Essuie-glaces..."
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', color: '#0C4A6E' }}>Valeur du Cadeau</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                required
                                                type="number"
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}
                                                value={formData.combinedGiftValue || 0}
                                                onChange={e => setFormData({ ...formData, combinedGiftValue: parseInt(e.target.value) || 0 })}
                                                placeholder="50"
                                            />
                                            <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '0.5rem', backgroundColor: '#E0F2FE', borderRadius: '4px', fontSize: '0.85rem', color: '#0369A1' }}>
                                        <strong>Total Offert : {(formData.combinedRefund || 0) + (formData.combinedGiftValue || 0)}€</strong>
                                        <br />
                                        Affiché comme : "Franchise ({formData.combinedRefund || 0}€) + {formData.customName || 'Cadeau'}"
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

                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1E293B' }}>Conditions Générales de Vente (CGV)</h3>
                            <div style={{
                                height: '200px',
                                overflowY: 'auto',
                                padding: '1rem',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: '#475569',
                                lineHeight: '1.5',
                                marginBottom: '1rem'
                            }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>CONDITIONS GÉNÉRALES DE VENTE</strong>
                                <strong style={{ display: 'block', marginBottom: '1rem' }}>Plateforme Vitrio – Professionnels du vitrage automobile</strong>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 1 – OBJET</strong>
                                <p style={{ marginBottom: '1rem' }}>Les présentes Conditions Générales de Vente (ci-après « CGV ») ont pour objet de définir les modalités selon lesquelles la société Vitrio met à disposition des professionnels du vitrage automobile (ci-après le « Garage ») une plateforme de mise en relation avec des clients particuliers souhaitant effectuer une prestation de réparation ou de remplacement de vitrage automobile.<br /><br />Vitrio agit exclusivement en qualité d’intermédiaire technique de mise en relation et ne réalise aucune prestation de réparation.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 2 – ACCEPTATION DES CGV</strong>
                                <p style={{ marginBottom: '1rem' }}>L’inscription du Garage sur la plateforme Vitrio implique l’acceptation pleine, entière et sans réserve des présentes CGV.<br />Toute utilisation de la plateforme vaut acceptation des CGV en vigueur à la date d’utilisation.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 3 – DÉFINITIONS</strong>
                                <p style={{ marginBottom: '0.5rem' }}><strong>3.1 Rendez-vous</strong><br />On entend par Rendez-vous toute demande de créneau formulée par un client final via la plateforme Vitrio auprès d’un Garage.</p>
                                <p style={{ marginBottom: '1rem' }}><strong>3.2 Rendez-vous Confirmé</strong><br />Un Rendez-vous Confirmé est réputé constitué lorsque l’ensemble des conditions cumulatives suivantes est rempli :<br />- Le client final a effectué une demande de rendez-vous via la plateforme Vitrio<br />- Le Garage a accepté le créneau proposé via la plateforme<br />- Le client final a confirmé explicitement le rendez-vous par l’un des moyens suivants : validation via lien de confirmation, réponse positive par SMS ou email, confirmation téléphonique tracée par Vitrio<br /><br />👉 La confirmation rend le rendez-vous définitif et facturable.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 4 – MODÈLE ÉCONOMIQUE ET FACTURATION</strong>
                                <p style={{ marginBottom: '0.5rem' }}><strong>4.1 Principe</strong><br />L’accès à la plateforme Vitrio est gratuit pour le Garage.<br />Vitrio perçoit une rémunération uniquement pour chaque Rendez-vous Confirmé, au tarif forfaitaire de :<br /><strong>55 € HT par Rendez-vous Confirmé</strong></p>
                                <p style={{ marginBottom: '0.5rem' }}><strong>4.2 Déclenchement de la facturation</strong><br />La facturation est déclenchée au moment de la confirmation du rendez-vous, indépendamment de la réalisation effective de la prestation.<br />En conséquence, ne donnent lieu à aucun remboursement : l’absence du client le jour du rendez-vous, l’annulation tardive par le client après confirmation, le refus ultérieur du client, le fait que le client ne donne pas suite à la prestation.</p>
                                <p style={{ marginBottom: '1rem' }}><strong>4.3 Périodicité de facturation</strong><br />Les Rendez-vous Confirmés sont facturés par période de quinze (15) jours.<br />À l’issue de chaque période, Vitrio émet une facture récapitulative correspondant aux rendez-vous confirmés durant ladite période.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 5 – CAS DE NON-FACTURATION</strong>
                                <p style={{ marginBottom: '1rem' }}>Un rendez-vous ne pourra être facturé uniquement dans les cas suivants :<br />- annulation par le client avant confirmation<br />- refus du rendez-vous par le Garage<br />- erreur technique imputable exclusivement à Vitrio<br />- demande manifestement hors périmètre des services proposés par le Garage<br /><br />Toute non-facturation relève de la décision souveraine de Vitrio, sur la base des éléments techniques disponibles.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 6 – CONTESTATIONS ET LITIGES</strong>
                                <p style={{ marginBottom: '0.5rem' }}><strong>6.1 Délai impératif</strong><br />Toute contestation relative à un Rendez-vous Confirmé doit être formulée dans un délai maximum de quarante-huit (48) heures suivant la confirmation.<br />À défaut, le rendez-vous sera réputé définitivement valide et non contestable.</p>
                                <p style={{ marginBottom: '1rem' }}><strong>6.2 Procédure</strong><br />Toute contestation devra impérativement comporter : l’identifiant du rendez-vous, le motif précis, les éléments justificatifs disponibles.<br />Vitrio se réserve le droit d’accepter ou refuser toute contestation.<br />Aucun remboursement n’est automatique.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 7 – CLAUSE ANTI-CONTOURNEMENT</strong>
                                <p style={{ marginBottom: '1rem' }}>Le Garage s’interdit formellement de contourner la plateforme Vitrio, notamment en :<br />- contactant directement un client issu de Vitrio afin d’éviter la facturation<br />- annulant un rendez-vous confirmé pour réaliser la prestation hors plateforme<br />- modifiant artificiellement le statut d’un rendez-vous<br /><br />Tout contournement avéré entraînera de plein droit : la facturation immédiate du rendez-vous concerné, une pénalité forfaitaire de 250 € HT par infraction, la suspension ou la résiliation du compte Garage.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 8 – PREUVES ET DONNÉES FAISANT FOI</strong>
                                <p style={{ marginBottom: '1rem' }}>Les données enregistrées par Vitrio (horodatage, confirmations, historiques, logs techniques, échanges) font foi entre les parties.<br />Le Garage reconnaît la valeur probante des systèmes d’enregistrement de Vitrio.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 9 – MODALITÉS DE PAIEMENT</strong>
                                <p style={{ marginBottom: '1rem' }}>Les factures sont payables à réception, sans escompte.<br />Tout retard de paiement entraînera de plein droit : la suspension immédiate de l’accès à la plateforme, l’application des pénalités légales en vigueur, l’indemnité forfaitaire pour frais de recouvrement prévue par la loi.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 10 – RESPONSABILITÉ</strong>
                                <p style={{ marginBottom: '1rem' }}>Vitrio n’est pas partie au contrat conclu entre le client final et le Garage.<br />Vitrio ne saurait être tenue responsable : de la réalisation de la prestation, de la qualité du service rendu, du comportement du client final.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 11 – RÉSILIATION</strong>
                                <p style={{ marginBottom: '1rem' }}>Vitrio se réserve le droit de suspendre ou résilier le compte d’un Garage en cas de : non-paiement, contournement, comportement frauduleux, atteinte à l’image de la plateforme.</p>

                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 12 – DROIT APPLICABLE</strong>
                                <p>Les présentes CGV sont soumises au droit français.<br />Tout litige relèvera de la compétence exclusive des tribunaux compétents du ressort du siège social de Vitrio.</p>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    required
                                    style={{ marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                                    J'ai lu et j'accepte les Conditions Générales de Vente (CGV). Je reconnais que chaque rendez-vous confirmé sera facturé <strong>55€ HT</strong> et je m'engage à respecter la charte qualité Vitrio.
                                </span>
                            </label>
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
