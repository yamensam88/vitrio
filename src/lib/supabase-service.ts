import { supabase } from './supabase'
import type { Database } from './supabase'

type Garage = Database['public']['Tables']['garages']['Row']
type AdminGarage = Database['public']['Tables']['admin_garages']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Offer = Database['public']['Tables']['offers']['Row']
type GarageAvailability = Database['public']['Tables']['garage_availabilities']['Row']

export const COMMISSION_RATE = 55

// Garages
export async function getGarages() {
    // We only fetch garages where the associated admin_garage status is 'Actif'
    const { data: adminGarages, error: adminErr } = await supabase
        .from('admin_garages')
        .select('garage_id, status')
        .eq('status', 'Actif')
        .not('garage_id', 'is', null);

    if (adminErr) throw adminErr;
    
    if (!adminGarages || adminGarages.length === 0) return [];
    
    const validGarageIds = adminGarages.map((a: any) => a.garage_id);

    const { data: garages, error: garagesErr } = await supabase
        .from('garages')
        .select('*')
        .in('id', validGarageIds);

    if (garagesErr) throw garagesErr;
    return garages as Garage[];
}

export async function getGarageById(id: string) {
    const { data, error } = await supabase
        .from('garages')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data as Garage
}

export async function getGarageByAccessCode(code: string) {
    console.log("DEBUG: Calling getGarageByAccessCode with code:", code);
    
    // 1. Fetch from admin_garages which holds the actual code
    const { data: adminGarage, error: adminErr } = await supabase
        .from('admin_garages')
        .select('garage_id, status')
        .eq('generated_code', code)
        .single();

    if (adminErr || !adminGarage || !adminGarage.garage_id) {
        console.error("DEBUG: Code not found in admin_garages or no linked garage:", adminErr);
        return null;
    }

    // 2. Fetch the linked public garage
    const { data: garageData, error: garageErr } = await supabase
        .from('garages')
        .select('*')
        .eq('id', adminGarage.garage_id)
        .single();

    if (garageErr || !garageData) {
        console.error("DEBUG: Linked public garage not found:", garageErr);
        return null;
    }

    console.log("DEBUG: Extracted status:", adminGarage.status);

    return {
        ...garageData,
        normalized_status: adminGarage.status || 'Inconnu'
    };
}

export async function updateGarageAvailability(id: string, nextAvailability: string) {
    const { error } = await supabase
        .from('garages')
        .update({ next_availability: nextAvailability })
        .eq('id', id)

    if (error) throw error
}

// Admin Garages
export async function getAdminGarages() {
    const { data, error } = await supabase
        .from('admin_garages')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as AdminGarage[]
}


// Appointments
export async function getAppointments() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Appointment[]
}

export async function getAppointmentsByGarage(garageId: string) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('garage_id', garageId)
        .order('date', { ascending: true })

    if (error) throw error
    return data as Appointment[]
}

export async function createAppointment(appointment: Database['public']['Tables']['appointments']['Insert']) {
    const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

    if (error) throw error
    return data as Appointment
}

export async function updateAppointmentStatus(id: number, status: string) {
    // Check if we need to trigger billing
    const { data: current, error: fetchError } = await supabase
        .from('appointments')
        .select('billing_triggered')
        .eq('id', id)
        .single()

    if (fetchError) throw fetchError

    const shouldTriggerBilling = status === 'Confirmé' && !current.billing_triggered

    const { error } = await supabase
        .from('appointments')
        .update({
            status,
            billing_triggered: shouldTriggerBilling ? true : current.billing_triggered
        })
        .eq('id', id)

    if (error) throw error

    if (shouldTriggerBilling) {
        console.log(`[BILLING] Facturation déclenchée pour RDV #${id}`)
    }
}

// Offers
export async function getOffersByGarage(garageId: string) {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('garage_id', garageId)

    if (error) throw error
    return data as Offer[]
}

// Availabilities
export async function getGarageAvailabilities(garageId: string) {
    const { data, error } = await supabase
        .from('garage_availabilities')
        .select('*')
        .eq('garage_id', garageId)
        .order('start_time', { ascending: true })

    if (error) throw error
    return data as GarageAvailability[]
}

export async function addGarageAvailability(availability: Database['public']['Tables']['garage_availabilities']['Insert']) {
    const { data, error } = await supabase
        .from('garage_availabilities')
        .insert(availability)
        .select()
        .single()

    if (error) throw error
    return data as GarageAvailability
}

export async function deleteGarageAvailability(id: number) {
    const { error } = await supabase
        .from('garage_availabilities')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Offer Management
export async function createOffer(offer: Database['public']['Tables']['offers']['Insert']) {
    const { data, error } = await supabase
        .from('offers')
        .insert(offer)
        .select()
        .single()

    if (error) throw error
    return data as Offer
}

export async function updateOffer(id: string, updates: Database['public']['Tables']['offers']['Update']) {
    const { data, error } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Offer
}

export async function deleteOffer(id: string) {
    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function updateGarageAvailabilitySlot(id: string, isAvailable: boolean) {
    const { error } = await supabase
        .from('garage_availabilities')
        .update({ is_available: isAvailable })
        .eq('id', id)

    if (error) throw error
}
