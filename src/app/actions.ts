"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { createAppointment, getGarageById } from "@/lib/supabase-service";
import { sendNotificationEmail } from "@/lib/email-service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Helper to get Admin Supabase client to bypass RLS for lookups/inserts during public flows
function getServiceSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient<Database>(supabaseUrl, supabaseKey);
}

export async function submitBooking(appointment: Database['public']['Tables']['appointments']['Insert']) {
    // 1. Insert into database
    // We can use the service layer since this is a public endpoint now secured by server execution
    const newAppt = await createAppointment(appointment);

    // 2. Lookup Garage Information
    const garage = await getGarageById(appointment.garage_id);
    
    const serviceClient = getServiceSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userResult = await (serviceClient.from('admin_garages') as any)
        .select('email')
        .eq('garage_id', appointment.garage_id)
        .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminGarage = userResult.data as any;

    const formattedDate = format(new Date(appointment.date), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    const vehicleName = appointment.plate || appointment.vehicle;

    // 3. Send Partner Email
    if (adminGarage?.email) {
        try {
            await sendNotificationEmail('partner_alert_new_appointment', {
                partnerEmail: adminGarage.email,
                vehicle: vehicleName,
                date: formattedDate
            });
        } catch (e) {
            console.error("Failed to send partner alert:", e);
        }
    }

    // 4. Send Client Email
    if (appointment.email) {
        try {
            await sendNotificationEmail('client_booking_confirmation', {
                clientEmail: appointment.email,
                clientName: appointment.client_name,
                vehicle: vehicleName,
                date: formattedDate,
                garageName: garage.name,
                garageAddress: garage.address
            });
        } catch (e) {
            console.error("Failed to send client confirmation:", e);
        }
    }

    return newAppt;
}

export async function submitPartnerRegistration(partnerData: Database['public']['Tables']['admin_garages']['Insert']) {
    // 1. Insert admin garage securely from server
    const serviceClient = getServiceSupabase();
    
    // We use service client to ensure insert succeeds regardless of restrictive RLS
    // Registration logic is thus entirely controlled by the server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (serviceClient.from('admin_garages') as any)
        .insert(partnerData)
        .select()
        .single();
        
    if (error) throw new Error("Erreur DB: " + error.message);

    // 2. Send Admin Alert Email
    try {
        await sendNotificationEmail('admin_alert_new_partner', {
            name: partnerData.name,
            city: partnerData.city,
            email: partnerData.email,
            phone: partnerData.phone
        });
    } catch (e) {
        console.error("Failed to send admin alert email:", e);
    }

    return data;
}
