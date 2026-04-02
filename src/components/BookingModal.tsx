import { Garage, Offer } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getGarageAvailabilities, getAppointmentsByGarage } from "@/lib/supabase-service";
import { submitBooking } from "@/app/actions";
import TimeSlotPicker from "./TimeSlotPicker";

interface BookingModalProps {
    garage: Garage;
    onClose: () => void;
}

type Step = "DATE" | "INFO" | "CONFIRM";

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
        fullName: "",
        interventionType: "Pare-brise",
        plate: "",
        insuranceName: "",
        postalCode: "",
        email: "",
        phone: "",
        privacyAccepted: false
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
        // INFO submits directly now
    };

    const handleBack = () => {
        if (step === "INFO") setStep("DATE");
    };

    const simulateUpload = (field: keyof typeof files) => {
        // Simulate a file upload delay
        setTimeout(() => {
            setFiles(prev => ({ ...prev, [field]: true }));
        }, 500);
    };

    const { addAppointment } = useApp();

    const handleConfirm = async () => {
        // FRENCH PHONE VALIDATION
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Veuillez entrer un numéro de téléphone valide (format français).");
            return;
        }

        if (selectedOffer && selectedDate) {
            setIsSubmitting(true);
            try {
                await submitBooking({
                    client_name: formData.fullName,
                    vehicle: formData.plate, // Using Plate as vehicle identifier
                    date: selectedDate.toISOString(),
                    amount: selectedOffer.price,
                    garage_id: garage.id,
                    offers: [selectedOffer.description],
                    email: formData.email,
                    phone: formData.phone,
                    status: "En attente",
                    billing_triggered: false,
                    // New Fields
                    intervention_type: formData.interventionType,
                    plate: formData.plate,
                    insurance_name: formData.insuranceName,
                    postal_code: formData.postalCode,
                    address: formData.postalCode // Map postal code to address as rough location if needed
                });

                // Also add to local context as a fallback/instant update
                addAppointment({
                    clientName: formData.fullName,
                    vehicle: formData.plate,
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
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Saisissez les informations</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Type d'intervention : *</label>
                                <select
                                    value={formData.interventionType}
                                    onChange={e => setFormData({ ...formData, interventionType: e.target.value })}
                                    className="input-field"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: 'white' }}
                                >
                                    <option value="Pare-brise">Pare-brise</option>
                                    <option value="Vitre latérale">Vitre latérale</option>
                                    <option value="Lunette arrière">Lunette arrière</option>
                                    <option value="Optique">Optique de phare</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Immatriculation du véhicule *</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: '14px', height: '46px', background: '#003399' }}></div>
                                    <input
                                        type="text"
                                        placeholder="AB-123-CB"
                                        value={formData.plate}
                                        onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', padding: '0.75rem', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Quelle est votre assurance ? *</label>
                                <input
                                    type="text"
                                    placeholder="Compatible Toutes Assurances"
                                    value={formData.insuranceName}
                                    onChange={e => setFormData({ ...formData, insuranceName: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Nom / Prénom *</label>
                                <input
                                    type="text"
                                    placeholder="Le RDV est réservé au nom de ..."
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Email *</label>
                                <input
                                    type="email"
                                    placeholder="la réservation du rendez-vous est envoyé à.."
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Téléphone *</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>🇫🇷</span>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>▼</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="06 12 34 56 78"
                                        value={formData.phone}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^[\d\s]*$/.test(val)) setFormData({ ...formData, phone: val });
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', paddingLeft: '4rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#4b5563' }}>Code Postal d'intervention *</label>
                            <input
                                type="text"
                                placeholder="On se déplace gratuitement"
                                value={formData.postalCode}
                                onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.privacyAccepted}
                                    onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                    J'accepte la politique de confidentialité de ce site.
                                </span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                                    opacity: (!formData.fullName || !formData.email || !formData.phone || !formData.plate || !formData.insuranceName || !formData.postalCode || !formData.privacyAccepted) ? 0.5 : 1,
                                    cursor: (!formData.fullName || !formData.email || !formData.phone || !formData.plate || !formData.insuranceName || !formData.postalCode || !formData.privacyAccepted) ? 'not-allowed' : 'pointer'
                                }}
                                disabled={!formData.fullName || !formData.email || !formData.phone || !formData.plate || !formData.insuranceName || !formData.postalCode || !formData.privacyAccepted || isSubmitting}
                                onClick={handleConfirm}
                            >
                                {isSubmitting ? "Validation..." : "Valider le RDV"}
                            </button>
                        </div>
                    </div>
                )}



                {/* STEP 4: SUCCESS */}
                {step === "CONFIRM" && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 1s' }}>⚡</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Demande Express Envoyée !</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                            Le créneau est actuellement <strong>pré-réservé</strong>. <br />
                            Le professionnel <strong>{garage.name}</strong> a été notifié en urgence.
                        </p>
                        
                        <div style={{ background: '#F0FDF4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '2rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <h4 style={{ color: '#166534', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Engagement Vitrio</h4>
                            </div>
                            <ul style={{ fontSize: '0.95rem', color: '#15803D', paddingLeft: '1.5rem', lineHeight: 1.6, margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem' }}>Le garage s'engage à confirmer votre venue <strong>sous 2 heures</strong>.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Si vous avez choisi l'offre Franchise Offerte, tout est pris en charge (0€ d'avance*).</li>
                                <li>Vous recevrez un SMS ou Email de confirmation dès l'acceptation par le garage.</li>
                            </ul>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            onClick={onClose}
                        >
                            Fermer et retourner à l'accueil
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
