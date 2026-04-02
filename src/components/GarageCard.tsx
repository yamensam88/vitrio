import { Garage } from "@/types";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";

interface GarageCardProps {
    garage: Garage;
    onSelect: (garage: Garage) => void;
}

// Composant SVG pour générer des étoiles selon une note (ex: 4.8)
const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FCD34D' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={rating >= star ? 'currentColor' : rating >= star - 0.5 ? 'url(#half)' : 'none'} stroke={rating >= star ? 'none' : '#CBD5E1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                        <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '4px', fontWeight: 500 }}>
                ({Math.floor(Math.random() * 100) + 20} avis)
            </span>
        </div>
    );
};

export const GarageCard = ({ garage, onSelect }: GarageCardProps) => {
    const bestOffer = garage.offers?.reduce((prev, current) => (prev.price > current.price) ? prev : current, garage.offers[0]);

    // Génération de 3 créneaux basés sur la prochaine disponibilité réelle
    const baseDate = new Date(garage.nextAvailability || new Date());
    const slots = [
        baseDate,
        addHours(baseDate, 2),
        addHours(baseDate, 4)
    ];

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', cursor: 'default' }}>
            
            {/* Image Cover */}
            <div style={{ width: '100%', height: '160px', position: 'relative', overflow: 'hidden' }}>
                <img 
                    src={garage.image || 'https://images.unsplash.com/photo-1542228262-3d663bfe57bf?auto=format&fit=crop&q=80&w=800'} 
                    alt={garage.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* Distance Badge Overlay */}
                {garage.distance !== undefined && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        📍 à {garage.distance} km
                    </div>
                )}
                
                {/* Recommended Badge Overlay */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#3B82F6', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Certifié
                </div>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Header Text */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                        {garage.name}
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{garage.address}</p>
                    <StarRating rating={garage.rating || 4.5} />
                </div>

                {/* Badges */}
                {(garage.homeService || garage.courtesyVehicle) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {garage.homeService && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '4px', fontWeight: 600 }}>
                                🏠 À domicile
                            </span>
                        )}
                        {garage.courtesyVehicle && (
                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '4px', fontWeight: 600 }}>
                                🚗 Véhicule de courtoisie
                            </span>
                        )}
                    </div>
                )}

                <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 -1rem 1rem -1rem' }}></div>

                {/* Quick Slots - PLANITY STYLE */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Prochaines disponibilités
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {slots.map((slot, i) => (
                            <button
                                key={i}
                                onClick={() => onSelect(garage)}
                                style={{ flex: 1, padding: '0.5rem 0', backgroundColor: i === 0 ? '#EFF6FF' : 'white', border: i === 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = i === 0 ? '#BFDBFE' : '#E2E8F0'}
                            >
                                <div style={{ fontSize: '0.75rem', color: i === 0 ? '#1D4ED8' : '#64748B', fontWeight: 600 }}>{i === 0 ? 'Auj.' : format(slot, 'E dd', { locale: fr })}</div>
                                <div style={{ fontSize: '0.9rem', color: i === 0 ? '#1E3A8A' : '#0F172A', fontWeight: 700 }}>{format(slot, 'HH:mm')}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Price & CTA */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', margin: '0 -1rem -1rem -1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            À partir de
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                            {bestOffer?.price ? `${bestOffer.price}€` : '120€'}
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => onSelect(garage)}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', width: 'auto' }}
                    >
                        Prendre RDV
                    </button>
                </div>

            </div>
        </div>
    );
};
