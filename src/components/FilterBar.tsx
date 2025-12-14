import { SortOption } from "@/hooks/useGarageSearch";

interface FilterBarProps {
    currentSort: SortOption[];
    onSortChange: (sort: SortOption[]) => void;
    disabled?: boolean;
}

export const FilterBar = ({ currentSort, onSortChange, disabled }: FilterBarProps) => {
    const options: { value: SortOption; label: string; icon: string }[] = [
        { value: "distance", label: "Proximité", icon: "📍" },
        { value: "price", label: "Meilleure Offre", icon: "💰" },
        { value: "availability", label: "Rdv Rapide", icon: "⚡️" },
    ];

    const toggleSort = (value: SortOption) => {
        if (currentSort.includes(value)) {
            onSortChange(currentSort.filter(s => s !== value));
        } else {
            onSortChange([...currentSort, value]);
        }
    };

    return (
        <div style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none'
        }}>
            {options.map((opt) => {
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
                        <span>{opt.icon}</span>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};
