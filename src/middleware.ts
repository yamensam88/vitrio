import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow access to login page
    if (pathname === '/admin/login') {
        return NextResponse.next()
    }

    // Protect all /admin/* routes
    if (pathname.startsWith('/admin')) {
        try {
            // Get Supabase credentials from environment
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

            // Create Supabase client
            const supabase = createClient(supabaseUrl, supabaseAnonKey)

            // Get session from cookies
            const token = request.cookies.get('sb-access-token')?.value
            const refreshToken = request.cookies.get('sb-refresh-token')?.value

            if (!token) {
                // No session, redirect to login
                const loginUrl = new URL('/admin/login', request.url)
                return NextResponse.redirect(loginUrl)
            }

            // Verify token with Supabase - use getUser for server-side verification
            const { data: { user }, error: userError } = await supabase.auth.getUser(token)

            if (userError || !user) {
                // Invalid session, redirect to login
                const loginUrl = new URL('/admin/login', request.url)
                return NextResponse.redirect(loginUrl)
            }

            // Verify user is an admin
            const { data: adminUser, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', user.email)
                .single()

            if (adminError || !adminUser) {
                // Not an admin, redirect to login
                const loginUrl = new URL('/admin/login', request.url)
                return NextResponse.redirect(loginUrl)
            }

            // User is authenticated and is an admin, allow access
            return NextResponse.next()
        } catch (error) {
            // Error checking auth, redirect to login
            const loginUrl = new URL('/admin/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
