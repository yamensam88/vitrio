import Link from "next/link";

export default function PartnerLanding() {
    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
            {/* Navigation */}
            <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vitrio <span style={{ color: 'var(--color-text-main)', fontWeight: 400 }}>Pro</span></Link>
                <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Retour au site client</Link>
            </nav>

            {/* Hero */}
            <section style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                        Remplissez vos créneaux vides <br />
                        <span style={{ color: 'var(--color-primary)' }}>sans dépenser 1€ en pub.</span>
                    </h1>
                    <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Vitrio vous envoie des clients qualifiés pour le remplacement de pare-brise. <br />
                        Vous ne payez une commission que si le client se présente.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/pro/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Devenir Partenaire Gratuitement
                        </Link>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Aucune carte bancaire requise • Validation en 24h
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section className="section" style={{ backgroundColor: 'white' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📉</div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Zéro Frais Fixes</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Fini les abonnements ou les coûts au clic sans résultat. Notre modèle est 100% à la performance.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Clients Qualifiés</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Nous vérifions les informations du véhicule et de l'assurance avant de vous envoyer le RDV.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📲</div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Gestion Simplifiée</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Un tableau de bord intuitif pour gérer vos disponibilités et valider les prestations effectuées.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
