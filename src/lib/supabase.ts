import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour Supabase
export type Database = {
    public: {
        Tables: {
            garages: {
                Row: {
                    id: string
                    name: string
                    address: string
                    city: string
                    lat: number
                    lng: number
                    rating: number
                    next_availability: string
                    image: string | null
                    access_code: string | null
                    home_service: boolean
                    courtesy_vehicle: boolean
                    franchise_offerte: boolean
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['garages']['Row'], 'created_at'>
                Update: Partial<Database['public']['Tables']['garages']['Insert']>
            }
            admin_garages: {
                Row: {
                    id: number
                    name: string
                    city: string
                    address: string | null
                    email: string | null
                    phone: string | null
                    siret: string | null
                    status: string
                    registration_date: string
                    garage_id: string | null
                    generated_code: string | null
                    offer_value: number | null
                    offer_description: string | null
                    home_service: boolean
                    courtesy_vehicle: boolean
                    franchise_offerte: boolean
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['admin_garages']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['admin_garages']['Insert']>
            }
            appointments: {
                Row: {
                    id: number
                    client_name: string
                    vehicle: string
                    email: string
                    phone: string
                    date: string
                    status: string
                    amount: number
                    garage_id: string
                    offers: string[]
                    billing_triggered: boolean
                    created_at: string
                    intervention_type?: string
                    plate?: string
                    insurance_name?: string
                    postal_code?: string
                    address?: string
                }
                Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['appointments']['Insert']>
            }
            offers: {
                Row: {
                    id: string
                    garage_id: string
                    price: number
                    currency: string
                    description: string
                    availability: string
                    service_duration: number
                }
                Insert: Database['public']['Tables']['offers']['Row']
                Update: Partial<Database['public']['Tables']['offers']['Insert']>
            }
            admin_users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    role: string
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
            }
            garage_availabilities: {
                Row: {
                    id: string
                    garage_id: string
                    start_time: string
                    end_time: string
                    is_available: boolean
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['garage_availabilities']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['garage_availabilities']['Insert']>
            }
        }
    }
}
