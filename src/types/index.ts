export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Offer {
    id: string;
    price: number;
    currency: string;
    description: string;
    availability: string; // ISO Date or "Immediate"
    serviceDuration: number; // in minutes
}

export interface Garage {
    id: string;
    name: string;
    address: string;
    city: string; // Added for SEO filtering
    coordinates: Coordinates;
    rating: number; // 0-5
    offers: Offer[];
    distance?: number; // Calculated distance from user in km
    nextAvailability: string; // ISO Date
    image?: string; // Placeholder string
    accessCode?: string; // Code de connexion partenaire
    homeService?: boolean; // Intervention à domicile/travail
    courtesyVehicle?: boolean; // Véhicule de courtoisie
    franchiseOfferte?: boolean; // Franchise offerte
}
