import { Garage, Offer } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getGarageAvailabilities, getAppointmentsByGarage, createAppointment } from "@/lib/supabase-service";
import TimeSlotPicker from "./TimeSlotPicker";

interface BookingModalProps {
    garage: Garage;
    onClose: () => void;
}

type Step = "DATE" | "INFO" | "DOCS" | "CONFIRM";

export const BookingModal = ({ garage, onClose }: BookingModalProps) => {
    const [step, setStep] = useState<Step>("DATE");
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(garage.offers[0] || null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (garage.id) {
            loadSlotData();
        }
    }, [garage.id]);

    async function loadSlotData() {
        setLoadingData(true);
        try {
            const [avs, appts] = await Promise.all([
                getGarageAvailabilities(garage.id),
                getAppointmentsByGarage(garage.id)
            ]);
            setAvailabilities(avs);
            setAppointments(appts);
        } catch (error) {
            console.error("Error loading slot data:", error);
        } finally {
            setLoadingData(false);
        }
    }

    // Form State
    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        address: "",
        email: "",
        phone: "",
        contractNumber: ""
    });

    // Simplified file state (just boolean for "uploaded" simulation)
    const [files, setFiles] = useState({
        carteGrise: false,
        assurance: false,
        sinistre: false,
        identity: false,
        photos: false
    });

    const handleNext = () => {
        if (step === "DATE" && selectedDate) setStep("INFO");
        else if (step === "INFO") setStep("DOCS");
        else if (step === "DOCS") setStep("CONFIRM");
    };

    const handleBack = () => {
        if (step === "INFO") setStep("DATE");
        else if (step === "DOCS") setStep("INFO");
    };

    const simulateUpload = (field: keyof typeof files) => {
        // Simulate a file upload delay
        setTimeout(() => {
            setFiles(prev => ({ ...prev, [field]: true }));
        }, 500);
    };

    const { addAppointment } = useApp();

    const handleConfirm = async () => {
        if (selectedOffer && selectedDate) {
            setIsSubmitting(true);
            try {
                await createAppointment({
                    client_name: `${formData.firstName} ${formData.lastName}`,
                    vehicle: "Véhicule Client",
                    date: selectedDate.toISOString(),
                    amount: selectedOffer.price,
                    garage_id: garage.id,
                    offers: [selectedOffer.description],
                    email: formData.email,
                    phone: formData.phone,
                    status: "En attente",
                    billing_triggered: false
                });

                // Also add to local context as a fallback/instant update
                addAppointment({
                    clientName: `${formData.firstName} ${formData.lastName}`,
                    vehicle: "Véhicule Client",
                    date: selectedDate.toISOString(),
                    amount: selectedOffer.price,
                    garageId: garage.id,
                    offers: [selectedOffer.description],
                    email: formData.email,
                    phone: formData.phone
                });

                setStep("CONFIRM");
            } catch (error) {
                console.error("Error creating appointment:", error);
                alert("Une erreur est survenue lors de la réservation. Veuillez réessayer.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderStepIndicator = () => (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '4px', background: step === 'DATE' ? 'var(--color-primary)' : '#10b981', borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '4px', background: step === 'INFO' ? 'var(--color-primary)' : (step === 'DATE' ? '#E2E8F0' : '#10b981'), borderRadius: '4px' }}></div>
            <div style={{ flex: 1, height: '4px', background: step === 'DOCS' ? 'var(--color-primary)' : (['DATE', 'INFO'].includes(step) ? '#E2E8F0' : '#10b981'), borderRadius: '4px' }}></div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(23, 37, 84, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="card"
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative',
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    &times;
                </button>

                {step !== 'CONFIRM' && (
                    <>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>
                            Rendez-vous chez {garage.name}
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {garage.address}
                        </p>
                        {renderStepIndicator()}
                    </>
                )}


                {/* STEP 1: DATE & TIME SELECTION */}
                {step === "DATE" && (
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>1. Choix de la date & heure</h3>

                        {loadingData ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chargement des créneaux...</div>
                        ) : (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <TimeSlotPicker
                                    mode="CUSTOMER"
                                    availabilities={availabilities}
                                    appointments={appointments}
                                    onSlotClick={(date) => setSelectedDate(date)}
                                    selectedDate={selectedDate}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" style={{ flex: 1, background: '#F1F5F9' }} onClick={onClose}>Annuler</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                disabled={!selectedDate}
                                onClick={handleNext}
                            >
                                Suivant &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: PERSONAL INFO */}
                {step === "INFO" && (
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>2. Vos Coordonnées</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text" placeholder="Prénom"
                                value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="input-field"
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%' }}
                            />
                            <input
                                type="text" placeholder="Nom"
                                value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%' }}
                            />
                        </div>
                        <input
                            type="text" placeholder="Adresse complète"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%', marginBottom: '1rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="email" placeholder="Email"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%' }}
                            />
                            <input
                                type="tel" placeholder="Téléphone"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, background: '#F1F5F9', color: '#64748B' }}
                                onClick={handleBack}
                            >
                                Retour
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{
                                    flex: 2,
                                    opacity: (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) ? 0.5 : 1,
                                    cursor: (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) ? 'not-allowed' : 'pointer'
                                }}
                                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address}
                                onClick={handleNext}
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DOCUMENTS */}
                {step === "DOCS" && (
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>3. Dossier Assurance</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                            Ces documents sont nécessaires pour la prise en charge directe (Tiers-payant).
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { key: 'carteGrise', label: 'Carte Grise (Recto/Verso)' },
                                { key: 'assurance', label: 'Attestation d\'assurance / Carte Verte' },
                                { key: 'sinistre', label: 'Déclaration de sinistre (si disponible)' },
                                { key: 'identity', label: 'Pièce d\'identité (CNI/Passeport)' },
                                { key: 'photos', label: 'Photo du pare-brise endommagé' },
                            ].map((field) => (
                                <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px dashed #CBD5E1', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{field.label}</span>
                                    {/* @ts-ignore */}
                                    {files[field.key] ? (
                                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>✅ Reçu</span>
                                    ) : (
                                        <button
                                            onClick={() => simulateUpload(field.key as keyof typeof files)}
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#EFF6FF', color: 'var(--color-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Joindre fichier
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, background: '#F1F5F9', color: '#64748B' }}
                                onClick={handleBack}
                            >
                                Retour
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                disabled={isSubmitting}
                                onClick={handleConfirm}
                            >
                                {isSubmitting ? "Validation en cours..." : "Valider le rendez-vous"}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === "CONFIRM" && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Réservation Confirmée !</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                            Votre dossier a été transmis à <strong>{garage.name}</strong>.
                            <br />Vous recevrez un email de confirmation à <strong>{formData.email}</strong>.
                        </p>
                        <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '2rem' }}>
                            <h4 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Prochaines étapes</h4>
                            <ul style={{ textAlign: 'left', fontSize: '0.9rem', color: '#15803D', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                                <li>Le garage va vérifier votre dossier assurance sous 24h.</li>
                                <li>Si tout est complet, vous n'aurez rien à avancer.</li>
                                <li>Présentez-vous le <strong>{selectedDate ? format(selectedDate, "dd MMM à HH:mm", { locale: fr }) : ''}</strong>.</li>
                            </ul>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
