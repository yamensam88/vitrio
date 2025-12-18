import { supabase } from './supabase'

// Admin Authentication Functions

export async function signInAdmin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error

    // Verify user is an admin
    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

    if (adminError || !adminUser) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized: Not an admin user')
    }

    return { session: data.session, user: data.user, adminUser }
}

export async function signOutAdmin() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentAdmin() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        return null
    }

    // Get admin user details
    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single()

    if (adminError || !adminUser) {
        return null
    }

    return { session, adminUser }
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const admin = await getCurrentAdmin()
    return admin !== null
}

// Helper to create admin user (for initial setup)
export async function createAdminUser(email: string, password: string, fullName?: string) {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) throw authError

    // Then create admin_users record
    const { data, error } = await supabase
        .from('admin_users')
        .insert({
            email,
            full_name: fullName || null,
            role: 'admin'
        })
        .select()
        .single()

    if (error) throw error
    return data
}
