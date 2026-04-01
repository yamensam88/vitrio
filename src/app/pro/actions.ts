"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { 
    getGarageById, 
    getAppointmentsByGarage, 
    updateAppointmentStatus, 
    getGarageAvailabilities, 
    addGarageAvailability, 
    deleteGarageAvailability, 
    getOffersByGarage, 
    createOffer, 
    updateOffer, 
    deleteOffer 
} from "@/lib/supabase-service";
import type { Database } from "@/lib/supabase";

type GarageAvailabilityInsert = Database['public']['Tables']['garage_availabilities']['Insert'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];
type OfferUpdate = Database['public']['Tables']['offers']['Update'];

const JWT_SECRET = process.env.JWT_SECRET || 'vitriopro-very-secret-key-12345';

async function verifyAuth(requiredGarageId?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('pro_session')?.value;
    if (!token) throw new Error("Non authentifié");

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        if (requiredGarageId && payload.garage_id !== requiredGarageId) {
            throw new Error("Accès non autorisé");
        }
        
        return payload.garage_id as string;
    } catch {
        throw new Error("Session invalide");
    }
}

export async function secureGetGarage(garageId: string) {
    await verifyAuth(garageId);
    return getGarageById(garageId);
}

export async function secureGetAppointments(garageId: string) {
    await verifyAuth(garageId);
    return getAppointmentsByGarage(garageId);
}

export async function secureGetAvailabilities(garageId: string) {
    await verifyAuth(garageId);
    return getGarageAvailabilities(garageId);
}

export async function secureGetOffers(garageId: string) {
    await verifyAuth(garageId);
    return getOffersByGarage(garageId);
}

export async function secureUpdateAppointmentStatus(id: number, status: string, garageId: string) {
    await verifyAuth(garageId); // Assuming we know the garageId context from UI
    return updateAppointmentStatus(id, status);
}

export async function secureAddAvailability(data: GarageAvailabilityInsert, garageId: string) {
    await verifyAuth(garageId);
    return addGarageAvailability(data);
}

export async function secureDeleteAvailability(id: number, garageId: string) {
    await verifyAuth(garageId);
    return deleteGarageAvailability(id);
}

export async function secureCreateOffer(data: OfferInsert, garageId: string) {
    await verifyAuth(garageId);
    return createOffer(data);
}

export async function secureUpdateOffer(id: string, updates: OfferUpdate, garageId: string) {
    await verifyAuth(garageId);
    return updateOffer(id, updates);
}

export async function secureDeleteOffer(id: string, garageId: string) {
    await verifyAuth(garageId);
    return deleteOffer(id);
}
