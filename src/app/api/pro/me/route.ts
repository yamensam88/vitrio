import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'vitriopro-very-secret-key-12345';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('pro_session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({
            garage_id: payload.garage_id,
            role: payload.role
        });
    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }
}
