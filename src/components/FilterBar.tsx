import { SortOption, ServiceFilter } from "@/hooks/useGarageSearch";

interface FilterBarProps {
    currentSort: SortOption[];
    onSortChange: (sort: SortOption[]) => void;
    serviceFilters: ServiceFilter[];
    onServiceFilterChange: (filters: ServiceFilter[]) => void;
    disabled?: boolean;
}

export const FilterBar = ({
    currentSort,
    onSortChange,
    serviceFilters,
    onServiceFilterChange,
    disabled
}: FilterBarProps) => {
    const sortOptions: { value: SortOption; label: string; icon: string }[] = [
        { value: "distance", label: "Proximité", icon: "📍" },
        { value: "price", label: "Meilleure Offre", icon: "💰" },
        { value: "availability", label: "Rdv Rapide", icon: "⚡️" },
    ];

    const serviceOptions: { value: ServiceFilter; label: string; icon: string }[] = [
        { value: "homeService", label: "Domicile", icon: "🏠" },
        { value: "courtesyVehicle", label: "Véhicule", icon: "🚗" },
    ];

    const toggleSort = (value: SortOption) => {
        if (currentSort.includes(value)) {
            onSortChange(currentSort.filter(s => s !== value));
        } else {
            onSortChange([...currentSort, value]);
        }
    };

    const toggleServiceFilter = (value: ServiceFilter) => {
        if (serviceFilters.includes(value)) {
            onServiceFilterChange(serviceFilters.filter(s => s !== value));
        } else {
            onServiceFilterChange([...serviceFilters, value]);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Sort Options */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'none'
            }}>
                {sortOptions.map((opt) => {
                    const isActive = currentSort.includes(opt.value);
                    return (
                        <button
                            key={opt.value}
                            onClick={() => toggleSort(opt.value)}
                            disabled={disabled}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--color-primary)' : '#E2E8F0',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'white',
                                color: isActive ? 'white' : 'var(--color-text-secondary)',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 119, 255, 0.2)' : 'none'
                            }}
                        >
                            <span style={{ filter: 'grayscale(100%)' }}>{opt.icon}</span>
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            {/* Service Filters */}
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginRight: '0.25rem' }}>Services :</span>
                {serviceOptions.map((opt) => {
                    const isActive = serviceFilters.includes(opt.value);
                    return (
                        <button
                            key={opt.value}
                            onClick={() => toggleServiceFilter(opt.value)}
                            disabled={disabled}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: isActive ? '#3b82f6' : '#E2E8F0',
                                backgroundColor: isActive ? '#eff6ff' : 'white',
                                color: isActive ? '#1e40af' : '#475569',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ marginRight: '0.5rem', filter: 'grayscale(100%)' }}>{opt.icon}</span>
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
