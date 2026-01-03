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
    const { data, error } = await supabase
        .from('garages')
        .select(`
            *,
            admin_garages!inner(status),
            offers(*)
        `)
        .eq('admin_garages.status', 'Actif')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Garage[]
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
    const { data, error } = await supabase
        .from('garages')
        .select(`
            *,
            admin_garages!inner(status)
        `)
        .eq('access_code', code)
        .single()

    if (error) {
        console.error("DEBUG: Error in getGarageByAccessCode:", error);
        return null;
    }

    console.log("DEBUG: getGarageByAccessCode data structure:", {
        id: data.id,
        admin_garages_type: typeof data.admin_garages,
        is_array: Array.isArray(data.admin_garages)
    });

    // Transform to ensure status is accessible correctly whether it's an object or an array of 1
    const garageData = data as any;
    let status = 'Inconnu';

    if (garageData.admin_garages) {
        if (Array.isArray(garageData.admin_garages)) {
            status = garageData.admin_garages[0]?.status || 'Inconnu';
        } else {
            status = garageData.admin_garages.status || 'Inconnu';
        }
    }

    console.log("DEBUG: Extracted status:", status);

    return {
        ...garageData,
        normalized_status: status
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

export async function createAdminGarage(garage: Database['public']['Tables']['admin_garages']['Insert']) {
    const { data, error } = await supabase
        .from('admin_garages')
        .insert(garage)
        .select()
        .single()

    if (error) throw error
    return data as AdminGarage
}

export async function updateAdminGarageStatus(id: number, status: string) {
    const { error } = await supabase
        .from('admin_garages')
        .update({ status })
        .eq('id', id)

    if (error) throw error
}

export async function generateAccessCodeForGarage(adminGarageId: number) {
    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString()

    // Get admin garage
    const { data: adminGarage, error: fetchError } = await supabase
        .from('admin_garages')
        .select('*')
        .eq('id', adminGarageId)
        .single()

    if (fetchError) throw fetchError

    // Update admin garage with generated code
    const { error: updateError } = await supabase
        .from('admin_garages')
        .update({ generated_code: code })
        .eq('id', adminGarageId)

    if (updateError) throw updateError

    // Create or update garage in garages table
    if (adminGarage.garage_id) {
        // Garage already exists, just update the access code
        const { error: garageUpdateError } = await supabase
            .from('garages')
            .update({ access_code: code })
            .eq('id', adminGarage.garage_id)

        if (garageUpdateError) throw garageUpdateError
    } else {
        // Create new garage
        const newGarageId = `g_${adminGarageId}_${Date.now()}`
        const garageData = {
            id: newGarageId,
            name: adminGarage.name,
            address: adminGarage.address || `${adminGarage.city} Centre`,
            city: adminGarage.city,
            lat: 48.8566 + (Math.random() * 0.1),
            lng: 2.3522 + (Math.random() * 0.1),
            rating: 5.0,
            next_availability: new Date().toISOString(),
            image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800',
            access_code: code,
            home_service: adminGarage.home_service || false,
            courtesy_vehicle: adminGarage.courtesy_vehicle || false,
            franchise_offerte: adminGarage.franchise_offerte || true
        };

        console.log("DEBUG: Inserting new garage with data:", garageData);

        const { error: garageCreateError } = await supabase
            .from('garages')
            .insert(garageData)

        if (garageCreateError) throw garageCreateError

        // Create default offer for the garage based on registration details
        const { error: offerCreateError } = await supabase
            .from('offers')
            .insert({
                id: `offer_${newGarageId}`,
                garage_id: newGarageId,
                price: adminGarage.offer_value || 120, // Use the value from registration
                currency: 'EUR',
                description: adminGarage.offer_description || 'Remplacement Standard',
                availability: new Date().toISOString(),
                service_duration: 120
            })

        if (offerCreateError) throw offerCreateError

        // Link the garage to admin_garage
        const { error: linkError } = await supabase
            .from('admin_garages')
            .update({ garage_id: newGarageId })
            .eq('id', adminGarageId)

        if (linkError) throw linkError
    }

    // Simulate email
    console.log(`[EMAIL SIMULATION] Code généré pour ${adminGarage.name}`)
    console.log(`Email: ${adminGarage.email || 'non fourni'}`)
    console.log(`Code: ${code}`)

    return code
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
