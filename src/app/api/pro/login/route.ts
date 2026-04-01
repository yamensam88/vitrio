import { NextResponse } from 'next/server';
import { getGarageByAccessCode } from '@/lib/supabase-service';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'vitriopro-very-secret-key-12345';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
        }

        const garage = await getGarageByAccessCode(code);

        if (!garage) {
            return NextResponse.json({ error: 'Code invalide' }, { status: 401 });
        }

        const garageData = garage as Record<string, unknown>;
        const status = (String(garageData.normalized_status || '')).toLowerCase();
        if (status !== 'actif') {
            return NextResponse.json({ error: 'Compte suspendu' }, { status: 403 });
        }

        // Generate JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({ garage_id: garage.id, role: 'pro' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d') // Session valides 7 jours
            .setIssuedAt()
            .sign(secret);

        const response = NextResponse.json({ success: true, garage_id: garage.id });

        // Set HTTP-Only cookie
        response.cookies.set({
            name: 'pro_session',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
