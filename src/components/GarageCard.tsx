import { Garage } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface GarageCardProps {
    garage: Garage;
    onSelect: (garage: Garage) => void;
}

export const GarageCard = ({ garage, onSelect }: GarageCardProps) => {
    const minPrice = Math.min(...garage.offers.map((o) => o.price));

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    {/* Badge Distance */}
                    {garage.distance !== undefined && (
                        <span style={{
                            backgroundColor: '#E0F2FE',
                            color: 'var(--color-primary-dark)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            display: 'inline-block'
                        }}>
                            📍 {garage.distance} km
                        </span>
                    )}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--color-text-main)' }}>{garage.name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{garage.address}</p>

                    {/* Service Badges */}
                    {(garage.homeService || garage.courtesyVehicle) && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {garage.homeService && (
                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', fontWeight: 600 }}>
                                    🏠 Intervention à domicile
                                </span>
                            )}
                            {garage.courtesyVehicle && (
                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontWeight: 600 }}>
                                    🚗 Véhicule de courtoisie
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1rem 0',
                borderTop: '1px solid #F1F5F9',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '1rem'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Avis Clients</div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ⭐️ {garage.rating}/5
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Prochain Créneau</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                        {format(new Date(garage.nextAvailability), "dd MMM à HH:mm", { locale: fr })}
                    </div>
                </div>
            </div>

            {/* Footer / Price */}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Offerts</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {minPrice}€
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => onSelect(garage)}
                >
                    Voir l'offre
                </button>
            </div>
        </div>
    );
};
