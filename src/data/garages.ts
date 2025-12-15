import { Garage } from "@/types";

export const MOCK_GARAGES: Garage[] = [
    {
        id: "g1",
        name: "AutoGlass Express Paris",
        address: "12 Rue de Rivoli, 75001 Paris",
        city: "Paris",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        rating: 4.8,
        nextAvailability: "2024-05-20T09:00:00.000Z",
        image: "/images/garage1.jpg",
        accessCode: "1234",
        offers: [
            {
                id: "o1",
                price: 120,
                currency: "EUR",
                description: "Remplacement Standard",
                availability: "2024-05-20T09:00:00.000Z",
                serviceDuration: 120,
            },
        ],
    },
    {
        id: "g2",
        name: "Rapid Pare-Brise Saint-Denis",
        address: "5 Avenue du Stade de France, 93210 Saint-Denis",
        city: "Saint-Denis",
        coordinates: { lat: 48.9244, lng: 2.3600 },
        rating: 4.2,
        nextAvailability: "2024-05-18T14:30:00.000Z", // Disponible plus tôt
        image: "/images/garage2.jpg",
        accessCode: "2222",
        offers: [
            {
                id: "o2",
                price: 90,
                currency: "EUR",
                description: "Offre Eco - Remplacement",
                availability: "2024-05-18T14:30:00.000Z",
                serviceDuration: 90,
            },
            {
                id: "o3",
                price: 150,
                currency: "EUR",
                description: "Premium + Nettoyage",
                availability: "2024-05-18T15:30:00.000Z",
                serviceDuration: 150,
            },
        ],
    },
    {
        id: "g3",
        name: "Master Glass Boulogne",
        address: "45 Route de la Reine, 92100 Boulogne-Billancourt",
        city: "Boulogne-Billancourt",
        coordinates: { lat: 48.8397, lng: 2.2426 },
        rating: 4.9,
        nextAvailability: "2024-05-21T10:00:00.000Z",
        image: "/images/garage3.jpg",
        accessCode: "3333",
        offers: [
            {
                id: "o4",
                price: 200,
                currency: "EUR",
                description: "Remplacement OEM & Calibration",
                availability: "2024-05-21T10:00:00.000Z",
                serviceDuration: 180,
            },
        ],
    },
    {
        id: "g4",
        name: "CheapFix Montreuil",
        address: "22 Rue de Paris, 93100 Montreuil",
        city: "Montreuil",
        coordinates: { lat: 48.8638, lng: 2.4484 },
        rating: 3.5,
        nextAvailability: "2024-05-18T08:00:00.000Z", // Très tôt
        image: "/images/garage4.jpg",
        accessCode: "4444",
        offers: [
            {
                id: "o5",
                price: 75,
                currency: "EUR",
                description: "Pare-brise occasion reconditionné",
                availability: "2024-05-18T08:00:00.000Z",
                serviceDuration: 60,
            },
        ],
    },
];
