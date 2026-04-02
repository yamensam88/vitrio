"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import * as crypto from "crypto";
import { sendNotificationEmail } from "@/lib/email-service";
import { 
    getAdminGarages, 
    getAppointments 
} from "@/lib/supabase-service";

// Internal helper to verify Admin session
async function verifyAdminAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) throw new Error("Non authentifié en tant qu'administrateur");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Client used purely to decode and verify token server-side via Supabase GoTrue Auth
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Session invalide ou expirée");

    // Check against admin_users
    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email || '')
        .single();

    if (adminError || !adminUser) throw new Error("Accès refusé : Rôle administrateur requis");

    return user;
}

// Ensure mutations bypass RLS confidently only verified via the Server Action wrapper
// since `supabase-service.ts` uses the Anon Key internally which is risky on client-side
export async function secureGetAdminData() {
    await verifyAdminAuth();
    // Proxy call
    const [garages, appointments] = await Promise.all([
        getAdminGarages(),
        getAppointments()
    ]);
    return { garages, appointments };
}

export async function secureDeleteAdminGarage(adminGarageId: number) {
    await verifyAdminAuth();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from('admin_garages') as any)
        .delete({ count: 'exact' })
        .eq('id', adminGarageId);
    if (error) throw error;
}

export async function secureUpdateAdminGarageStatus(adminGarageId: number, status: string) {
    await verifyAdminAuth();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from('admin_garages') as any)
        .update({ status })
        .eq('id', adminGarageId);
    if (error) throw error;
}

export async function secureGenerateAccessCode(adminGarageId: number) {
    await verifyAdminAuth();
    
    // 1. Generate CRYTOGRAHICALLY SECURE 4-digit code (unlike Math.random)
    const secureCode = crypto.randomInt(1000, 10000).toString();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey);

    // Get admin garage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminGarage, error: fetchError } : { data: any, error: any } = await (supabaseAdmin.from('admin_garages') as any)
        .select('*')
        .eq('id', adminGarageId)
        .single();
    if (fetchError) throw fetchError;

    // Update Access Code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabaseAdmin.from('admin_garages') as any)
        .update({ generated_code: secureCode })
        .eq('id', adminGarageId);
    if (updateError) throw updateError;

    // Synchronize to public garages table
    let publicGarageId = adminGarage.garage_id;

    if (publicGarageId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: garageUpdateError } = await (supabaseAdmin.from('garages') as any)
            .update({ access_code: secureCode })
            .eq('id', publicGarageId);
        if (garageUpdateError) throw garageUpdateError;
    } else {
        // Geocode the address using Nominatim OpenStreetMap
        let lat = 48.8566 + (Math.random() * 0.1);
        let lng = 2.3522 + (Math.random() * 0.1);
        try {
            const query = adminGarage.address ? `${adminGarage.address}, ${adminGarage.city}` : adminGarage.city;
            if (query) {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
                    headers: { 'User-Agent': 'Vitrio-Comparateur/1.0' }
                });
                const geoData = await res.json();
                if (geoData && geoData.length > 0) {
                    lat = parseFloat(geoData[0].lat);
                    lng = parseFloat(geoData[0].lon);
                }
            }
        } catch (e) {
            console.error('Geocoding error:', e);
        }

        // Create new public garage and let Postgres generate the UUID
        const newGarage = {
            name: adminGarage.name,
            address: adminGarage.address || `${adminGarage.city} Centre`,
            city: adminGarage.city,
            coordinates: { lat, lng },
            rating: 5.0,
            next_availability: new Date().toISOString(),
            image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800',
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: createdGarage, error: garageCreateError } = await (supabaseAdmin.from('garages') as any)
            .insert(newGarage)
            .select('id')
            .single();
            
        if (garageCreateError) {
            console.error("DEBUG GARAGE CREATE ERROR:", garageCreateError);
            throw garageCreateError;
        }

        publicGarageId = createdGarage.id;

        // Link back to admin_garage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: linkError } = await (supabaseAdmin.from('admin_garages') as any)
            .update({ garage_id: publicGarageId })
            .eq('id', adminGarageId);
        if (linkError) throw linkError;
    }

    // Send the Notification Email via the Secure Module
    if (adminGarage.email) {
        await sendNotificationEmail('partner_accepted', {
            email: adminGarage.email,
            name: adminGarage.name,
            code: secureCode
        });
    }

    return secureCode;
}
