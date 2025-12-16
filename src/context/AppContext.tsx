"use client";

import { createContext, useContext, useState, ReactNode } from 'react';


import { Garage } from "@/types";
import { MOCK_GARAGES } from "@/data/garages";

// Types
export interface Appointment {
    id: number;
    clientName: string;
    vehicle: string;
    email: string; // Added for masking demo
    phone: string; // Added for masking demo
    date: string; // ISO String
    status: "En attente" | "Confirmé" | "Terminé";
    amount: number;
    garageId: string;
    offers: string[];
    billingTriggered?: boolean; // New flag
}

export interface AdminGarage {
    id: number;
    name: string;
    city: string;
    status: "En attente" | "Actif" | "Suspendu";
    registrationDate: string;
    garageId?: string; // Link to search/appointment system
    email?: string; // Pour envoi du code
    generatedCode?: string; // Code généré par l'admin
    homeService?: boolean;
    courtesyVehicle?: boolean;
}

export interface RegistrationPayload extends Omit<AdminGarage, 'id' | 'status' | 'registrationDate' | 'generatedCode'> {
    offerDescription: string;
    offerPrice: number;
}

interface AppContextType {
    appointments: Appointment[];
    addAppointment: (app: Omit<Appointment, 'id' | 'status' | 'billingTriggered'>) => void;
    updateAppointmentStatus: (id: number, status: Appointment['status']) => void;

    adminGarages: AdminGarage[];
    searchableGarages: Garage[]; // New Search State
    updateGarageStatus: (id: number, status: AdminGarage['status']) => void;
    addGarage: (garage: RegistrationPayload) => void;

    // Partner Auth
    userGarage: Garage | null;
    loginGarage: (code: string) => boolean;
    logoutGarage: () => void;
    updateGarageAvailability: (date: string) => void;
    generateAccessCode: (garageId: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    // --- Appointments State (Shared between Client & Partner) ---
    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: 1,
            clientName: "Jean D.",
            vehicle: "Peugeot 208",
            email: "jean.d@example.com",
            phone: "06 12 34 56 78",
            date: "2024-05-20T14:00:00.000Z",
            status: "Confirmé",
            amount: 120,
            garageId: "g1",
            offers: ["Remplacement Standard"],
            billingTriggered: true
        },
        {
            id: 2,
            clientName: "Sophie M.",
            vehicle: "Renault Clio IV",
            email: "sophie.m@example.com",
            phone: "07 98 76 54 32",
            date: "2024-05-21T09:30:00.000Z",
            status: "En attente",
            amount: 150,
            garageId: "g1",
            offers: ["Premium + Nettoyage"]
        },
    ]);

    const addAppointment = (app: Omit<Appointment, 'id' | 'status' | 'billingTriggered'>) => {
        const newApp: Appointment = {
            ...app,
            id: Math.max(0, ...appointments.map(a => a.id)) + 1,
            status: "En attente",
            billingTriggered: false
        };
        setAppointments(prev => [newApp, ...prev]);
    };

    const updateAppointmentStatus = (id: number, status: Appointment['status']) => {
        setAppointments(prev => prev.map(a => {
            if (a.id !== id) return a;

            // Logic: If moving to 'Confirmé', trigger billing
            const shouldTriggerBilling = status === 'Confirmé' && !a.billingTriggered;
            if (shouldTriggerBilling) {
                console.log(`[BILLING] Facturation déclenchée pour RDV #${id} (${a.amount}€)`);
            }

            return {
                ...a,
                status,
                billingTriggered: shouldTriggerBilling ? true : a.billingTriggered
            };
        }));
    };

    // --- Admin Garages State ---
    const [adminGarages, setAdminGarages] = useState<AdminGarage[]>([
        { id: 1, name: "AutoGlass Paris 12", city: "Paris", status: "Actif", registrationDate: "2024-01-15", garageId: "g1" }, // Linked to demo appointments
        { id: 2, name: "Rapid Pare-Brise Lyon", city: "Lyon", status: "En attente", registrationDate: "2025-12-12" },
        { id: 3, name: "Marseille Vitrage", city: "Marseille", status: "Suspendu", registrationDate: "2023-11-20" },
        { id: 4, name: "Bordeaux Glass", city: "Bordeaux", status: "En attente", registrationDate: "2025-12-13" },
    ]);

    // --- Searchable Garages State ---
    const [searchableGarages, setSearchableGarages] = useState<Garage[]>(MOCK_GARAGES);

    const updateGarageStatus = (id: number, status: AdminGarage['status']) => {
        setAdminGarages(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    };

    const addGarage = (garage: RegistrationPayload) => {
        const id = Math.max(0, ...adminGarages.map(g => g.id)) + 1;
        const newGarageId = `g${id + 100}`; // Unique ID for search

        // 1. Add to Admin Dashboard
        const newAdminGarage: AdminGarage = {
            id: id,
            name: garage.name,
            city: garage.city,
            status: "En attente",
            registrationDate: new Date().toISOString().split('T')[0],
            garageId: newGarageId, // Link!
            email: garage.email,
            homeService: garage.homeService,
            courtesyVehicle: garage.courtesyVehicle
        };
        setAdminGarages(prev => [newAdminGarage, ...prev]);

        // 2. Add to Search Results (Instant Visibility for Demo)
        const newSearchGarage: Garage = {
            id: newGarageId,
            name: garage.name,
            address: `${garage.city} Centre`, // Mock Address
            city: garage.city,
            coordinates: { lat: 48.8566 + (Math.random() * 0.1), lng: 2.3522 + (Math.random() * 0.1) }, // Mock Location near Paris
            rating: 5.0, // New garage gets boost
            nextAvailability: new Date().toISOString(), // Available now
            image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800",
            homeService: garage.homeService,
            courtesyVehicle: garage.courtesyVehicle,
            offers: [{
                id: `o_${newGarageId}`,
                price: garage.offerPrice,
                currency: "EUR",
                description: garage.offerDescription,
                availability: new Date().toISOString(),
                serviceDuration: 120
            }]
        };
        setSearchableGarages(prev => [newSearchGarage, ...prev]);
    };

    // --- Partner Auth State ---
    const [userGarage, setUserGarage] = useState<Garage | null>(null);

    const loginGarage = (code: string): boolean => {
        const garage = searchableGarages.find(g => g.accessCode === code);
        if (garage) {
            setUserGarage(garage);
            return true;
        }
        return false;
    };

    const logoutGarage = () => {
        setUserGarage(null);
    };

    const updateGarageAvailability = (date: string) => {
        if (!userGarage) return;
        const updatedGarage = { ...userGarage, nextAvailability: date };
        setUserGarage(updatedGarage); // Update local user state
        setSearchableGarages(prev => prev.map(g => g.id === userGarage.id ? updatedGarage : g)); // Update global search state
    };

    const generateAccessCode = (garageId: number): string => {
        // Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Find admin garage
        const adminGarage = adminGarages.find(g => g.id === garageId);
        if (!adminGarage) return '';

        // Update admin garage with code
        setAdminGarages(prev => prev.map(g =>
            g.id === garageId ? { ...g, generatedCode: code } : g
        ));

        // Create/Update searchable garage with access code
        if (adminGarage.garageId) {
            setSearchableGarages(prev => prev.map(g =>
                g.id === adminGarage.garageId ? { ...g, accessCode: code } : g
            ));
        }

        // Simulate email sending
        console.log(`[EMAIL SIMULATION] Envoi du code d'accès au garage "${adminGarage.name}"`);
        console.log(`Destinataire: ${adminGarage.email || 'email@non-fourni.com'}`);
        console.log(`Code d'accès: ${code}`);
        console.log(`Message: "Bonjour, votre inscription a été validée. Connectez-vous avec le code: ${code}"`);

        return code;
    };

    return (
        <AppContext.Provider value={{
            appointments,
            addAppointment,
            updateAppointmentStatus,
            adminGarages,
            searchableGarages,
            updateGarageStatus,
            addGarage,
            userGarage,
            loginGarage,
            logoutGarage,
            updateGarageAvailability,
            generateAccessCode
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
