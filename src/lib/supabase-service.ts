import { supabase } from './supabase'
import type { Database } from './supabase'

type Garage = Database['public']['Tables']['garages']['Row']
type AdminGarage = Database['public']['Tables']['admin_garages']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Offer = Database['public']['Tables']['offers']['Row']

// Garages
export async function getGarages() {
    const { data, error } = await supabase
        .from('garages')
        .select('*')
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
    const { data, error } = await supabase
        .from('garages')
        .select('*')
        .eq('access_code', code)
        .single()

    if (error) return null
    return data as Garage
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

    // If garage_id exists, update the garage's access_code
    if (adminGarage.garage_id) {
        const { error: garageUpdateError } = await supabase
            .from('garages')
            .update({ access_code: code })
            .eq('id', adminGarage.garage_id)

        if (garageUpdateError) throw garageUpdateError
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
