"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitPartnerRegistration } from "@/app/actions";

export default function PartnerLandingAndOperations() {
    const router = useRouter();
    
    // Registration State
    const [regLoading, setRegLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "", siret: "", city: "", address: "", email: "", phone: "",
        offerType: 'finance' as 'finance' | 'gift' | 'combined',
        customName: "", customValue: 0, combinedRefund: 0, combinedGiftValue: 0,
        homeService: false, courtesyVehicle: false
    });

    // Login State
    const [code, setCode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        try {
            const response = await fetch('/api/pro/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                router.push('/pro/dashboard');
            } else {
                const data = await response.json();
                setLoginError(data.error || "Code invalide. Veuillez vérifier votre code d'accès.");
            }
        } catch (err) {
            setLoginError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            let description = "";
            let effectivePrice = 0;

            if (formData.offerType === 'finance') {
                description = `Franchise offerte (jusqu'à ${formData.customValue}€)`;
                effectivePrice = formData.customValue;
            } else if (formData.offerType === 'combined') {
                const refund = formData.combinedRefund || 0;
                const giftVal = formData.combinedGiftValue || 0;
                description = `Franchise (${refund}€) + ${formData.customName || 'Cadeau'}`;
                effectivePrice = refund + giftVal;
            } else {
                description = `${formData.customName} Offert(e) (Val. ${formData.customValue}€)`;
                effectivePrice = formData.customValue;
            }

            await submitPartnerRegistration({
                name: formData.name, city: formData.city, address: formData.address,
                email: formData.email, phone: formData.phone, siret: formData.siret,
                status: 'En attente', registration_date: new Date().toISOString().split('T')[0],
                garage_id: null, generated_code: null, offer_value: effectivePrice,
                offer_description: description, home_service: formData.homeService,
                courtesy_vehicle: formData.courtesyVehicle,
                franchise_offerte: formData.offerType === 'finance' || formData.offerType === 'combined'
            });

            alert('Inscription envoyée ! Vous recevrez un email avec votre code d\'accès une fois validé par l\'admin.');
            setFormData({
                name: "", siret: "", city: "", address: "", email: "", phone: "",
                offerType: 'finance', customName: "", customValue: 0,
                combinedRefund: 0, combinedGiftValue: 0, homeService: false, courtesyVehicle: false
            });
        } catch (error: any) {
            alert(`Erreur lors de l'inscription: ${error?.message || 'Veuillez réessayer.'}`);
        } finally {
            setRegLoading(false);
        }
    };

    const scrollToForm = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const scrollToLogin = () => {
        document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}>
            {/* Navigation */}
            <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button onClick={scrollToLogin} style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Se connecter</button>
                    <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Retour au site client</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                        Remplissez vos créneaux vides <br />
                        <span style={{ color: 'var(--color-primary)' }}>sans dépenser 1€ en pub.</span>
                    </h1>
                    <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Vitrio vous envoie des clients qualifiés pour le remplacement de pare-brise. <br />
                        Vous ne payez une commission que si le client se présente.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={scrollToForm} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Devenir Partenaire Gratuitement
                        </button>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Aucune carte bancaire requise • Validation en 24h
                    </p>
                </div>
            </section>

            {/* Main Content Layout (Form left, Login right) */}
            <section className="container" style={{ padding: '2rem 1rem 4rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                
                {/* Registration Form (Left Column) */}
                <div id="register-section" className="card" style={{ flex: '1 1 600px', padding: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Rejoignez le réseau Vitrio
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Inscription gratuite et sans engagement. Remplissez ce formulaire complet.
                    </p>

                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Nom du Garage</label>
                            <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="ex: AutoGlass Paris" />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Numéro SIRET</label>
                            <input required type="text" className="input-field" value={formData.siret} onChange={e => setFormData({ ...formData, siret: e.target.value })} placeholder="123 456 789 00012" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Adresse complète</label>
                                <input required type="text" className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="ex: 123 rue de Rivoli, 75001 Paris" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Ville</label>
                                <input required type="text" className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Paris" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Téléphone</label>
                                <input required type="tel" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="01 23 45 67 89" />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Email Professionnel</label>
                            <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="contact@garage.com" />
                        </div>

                        {/* OFFER SECTION */}
                        <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD' }}>
                            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem', color: '#0369A1' }}>Votre Offre Vitrio</h3>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, offerType: 'finance' }))} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: formData.offerType === 'finance' ? '#0284C7' : '#E2E8F0', backgroundColor: formData.offerType === 'finance' ? '#E0F2FE' : 'white', color: formData.offerType === 'finance' ? '#0284C7' : '#64748B', fontWeight: 600 }}>💰 Remboursement</button>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, offerType: 'gift' }))} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: formData.offerType === 'gift' ? '#0284C7' : '#E2E8F0', backgroundColor: formData.offerType === 'gift' ? '#E0F2FE' : 'white', color: formData.offerType === 'gift' ? '#0284C7' : '#64748B', fontWeight: 600 }}>🎁 Cadeau</button>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, offerType: 'combined' }))} style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid', borderColor: formData.offerType === 'combined' ? '#0284C7' : '#E2E8F0', backgroundColor: formData.offerType === 'combined' ? '#E0F2FE' : 'white', color: formData.offerType === 'combined' ? '#0284C7' : '#64748B', fontWeight: 600 }}>✨ Les deux</button>
                            </div>

                            {formData.offerType === 'finance' ? (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Montant offert / Remboursé</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input required type="number" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.customValue} onChange={e => setFormData({ ...formData, customValue: parseInt(e.target.value) || 0 })} placeholder="100" />
                                        <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>Sera affiché comme : "Franchise offerte jusqu'à {formData.customValue}€"</div>
                                </div>
                            ) : formData.offerType === 'gift' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Nature du Cadeau</label>
                                        <input required type="text" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.customName} onChange={e => setFormData({ ...formData, customName: e.target.value })} placeholder="ex: Nintendo Switch Lite" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Valeur Estimée</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input required type="number" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.customValue} onChange={e => setFormData({ ...formData, customValue: parseInt(e.target.value) || 0 })} placeholder="200" />
                                            <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Remboursé</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input required type="number" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.combinedRefund || 0} onChange={e => setFormData({ ...formData, combinedRefund: parseInt(e.target.value) || 0 })} placeholder="100" />
                                                <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Valeur Cadeau</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input required type="number" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.combinedGiftValue || 0} onChange={e => setFormData({ ...formData, combinedGiftValue: parseInt(e.target.value) || 0 })} placeholder="50" />
                                                <span style={{ fontWeight: 700, color: '#0369A1' }}>€</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#0C4A6E', marginBottom: '0.25rem' }}>Nature du Cadeau</label>
                                        <input required type="text" className="input-field" style={{ border: '1px solid #BAE6FD' }} value={formData.customName} onChange={e => setFormData({ ...formData, customName: e.target.value })} placeholder="ex: Carte Carburant..." />
                                    </div>
                                    <div style={{ padding: '0.75rem', backgroundColor: '#E0F2FE', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#0369A1' }}>
                                        <strong>Total Offert : {(formData.combinedRefund || 0) + (formData.combinedGiftValue || 0)}€</strong><br />
                                        Sera affiché : "Franchise ({formData.combinedRefund || 0}€) + {formData.customName || 'Cadeau'}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Services Section */}
                        <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem', color: '#166534' }}>Services Proposés</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.homeService} onChange={e => setFormData({ ...formData, homeService: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                    <span style={{ fontSize: '0.9rem', color: '#166534' }}>🏠 Intervention à domicile ou sur le lieu de travail</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.courtesyVehicle} onChange={e => setFormData({ ...formData, courtesyVehicle: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                    <span style={{ fontSize: '0.9rem', color: '#166534' }}>🚗 Véhicule de courtoisie disponible</span>
                                </label>
                            </div>
                        </div>

                        {/* CGV */}
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Conditions Générales de Vente (CGV)</h3>
                            <div style={{ height: '150px', overflowY: 'auto', padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 4 – MODÈLE ÉCONOMIQUE ET FACTURATION</strong>
                                <p style={{ marginBottom: '1rem' }}>Vitrio perçoit une rémunération uniquement pour chaque Rendez-vous Confirmé, au tarif forfaitaire de :<br /><strong>55 € HT par Rendez-vous Confirmé</strong></p>
                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>ARTICLE 7 – CLAUSE ANTI-CONTOURNEMENT</strong>
                                <p style={{ marginBottom: '1rem' }}>Le Garage s’interdit formellement de contourner la plateforme Vitrio... Tout contournement avéré entraînera de plein droit : la facturation immédiate du rendez-vous concerné, une pénalité forfaitaire de 250 € HT par infraction.</p>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" required style={{ marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                                    J'ai lu et j'accepte les CGV. Je reconnais que chaque rendez-vous confirmé sera facturé <strong>55€ HT</strong>.
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={regLoading} className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', width: '100%', justifyContent: 'center' }}>
                            {regLoading ? 'Création en cours...' : 'Valider mon inscription'}
                        </button>
                    </form>
                </div>

                {/* Login Form (Right Column) */}
                <div id="login-section" style={{ flex: '1 1 350px' }}>
                    <div className="card" style={{ position: 'sticky', top: '2rem', padding: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                            Connectez-vous à votre espace pro
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            Déjà partenaire ? Accédez à vos rendez-vous et vos statistiques en direct.
                        </p>

                        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                                    Code d&apos;accès
                                </label>
                                <input
                                    id="code"
                                    type="password"
                                    required
                                    className="input-field"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Entrez votre code confidentiel"
                                    style={{ padding: '0.875rem' }}
                                />
                            </div>

                            {loginError && (
                                <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', fontSize: '1rem' }}
                            >
                                {loginLoading ? 'Connexion en cours...' : 'Accéder à mon tableau de bord'}
                            </button>
                        </form>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Code d'accès perdu ? Contactez vitrio.contact@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
                
            </section>
        </main>
    );
}
