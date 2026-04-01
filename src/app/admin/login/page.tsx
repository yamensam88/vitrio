"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const { getCurrentAdmin } = await import('@/lib/supabase-admin');
            const admin = await getCurrentAdmin();
            if (admin) {
                router.push('/admin/dashboard');
            }
        } catch (err) {
            // Not logged in, stay on login page
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signInAdmin(email, password);

            // Set cookies for middleware
            const { session } = result;
            if (session) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
                document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
            }

            router.push('/admin/dashboard');
        } catch (err: any) {
            console.error("DEBUG LOGIN ERROR:", err);
            setError(err.message || "Identifiants invalides. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) var(--spacing-md)', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <span style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--color-text-main)' }}>
                    Vitrio
                </span>
                <span style={{ fontWeight: 400, fontSize: '2rem', color: 'var(--color-primary)' }}>
                    {' '}Admin
                </span>
                <h2 style={{ marginTop: 'var(--spacing-md)', fontFamily: 'var(--font-heading)', color: 'var(--color-text-main)' }}>
                    Connexion Administrateur
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                    Accès réservé aux administrateurs
                </p>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-main)' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@vitrio.fr"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-main)' }}>
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
