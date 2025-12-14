import { MOCK_GARAGES } from "@/data/garages";
import { GarageCard } from "@/components/GarageCard";
import Link from "next/link";
import { Metadata } from 'next';

type Props = {
    params: { city: string }
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const city = capitalize(params.city);
    return {
        title: `Remplacement Pare-Brise à ${city} (75) | Vitrio`,
        description: `Comparez les meilleurs spécialistes du pare-brise à ${city}. Prix, disponibilités et avis vérifiés. Prenez rendez-vous en ligne gratuitement sur Vitrio.`,
    }
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CityPage({ params }: Props) {
    const city = capitalize(params.city);

    // SEO Logic: Filter by city (exact match for now, could be improved)
    // In a real app we would query the DB
    const cityGarages = MOCK_GARAGES.filter(
        g => g.city.toLowerCase() === params.city.toLowerCase()
    );

    // Fallback: If no specific garage in this city (mock limitation), display all to show the UI
    // In real life, we would show "No results in [City], but here are the closest"
    const displayGarages = cityGarages.length > 0 ? cityGarages : MOCK_GARAGES;
    const isFallback = cityGarages.length === 0;

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '4rem', backgroundColor: 'var(--color-background)' }}>
            {/* Nav */}
            <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem', borderBottom: '1px solid #E2E8F0' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vitrio</Link>
                <Link href="/pro" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Accès Pro</Link>
            </nav>

            {/* SEO Hero */}
            <section style={{ padding: '4rem 1rem 2rem', textAlign: 'center', backgroundColor: 'white' }}>
                <div className="container">
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        France &gt; Île-de-France &gt; <span style={{ color: 'var(--color-text-main)' }}>{city}</span>
                    </p>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                        Les meilleurs spécialistes pare-brise à <span style={{ color: 'var(--color-primary)' }}>{city}</span>
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--color-text-secondary)' }}>
                        Comparez les tarifs et disponibilités des garages agréés à {city}. Remplacement de pare-brise, réparation d'impact, et calibrage caméra.
                    </p>
                </div>
            </section>

            {/* Results */}
            <div className="container" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                    {isFallback ? `Nos experts recommandés (Garages à ${city} indisponibles pour le moment)` : `${displayGarages.length} Garages trouvés à ${city}`}
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {displayGarages.map((garage) => (
                        <div key={garage.id} style={{ height: '100%' }}>
                            {/* Reusing GarageCard logic but simplified for server component demo 
                    In a real app, Client Component wrapper would handle the 'onSelect' 
                */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--color-text-main)' }}>{garage.name}</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{garage.address}</p>
                                </div>
                                <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>dès {Math.min(...garage.offers.map(o => o.price))}€</div>
                                    <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', textDecoration: 'none' }}>
                                        Voir les disponibilités
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
