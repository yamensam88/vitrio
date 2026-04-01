"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PartnerLogin() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Redirection should ideally be handled by middleware if logged in
        // A simple ping could be placed here if needed, but not strictly required
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("DEBUG: Attempting login with API");
            const response = await fetch('/api/pro/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                router.push('/pro/dashboard');
            } else {
                const data = await response.json();
                setError(data.error || "Code invalide. Veuillez vérifier votre code d'accès.");
            }
        } catch (err) {
            console.error("DEBUG: Login error:", err);
            setError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--spacing-2xl) var(--spacing-md)', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                    Espace Partenaire
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Connectez-vous pour gérer vos rendez-vous
                </p>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label htmlFor="code" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                            Code d&apos;accès
                        </label>
                        <input
                            id="code"
                            name="code"
                            type="password"
                            required
                            className="input-field"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Entrez votre code confidentiel"
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
                        style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', justifyContent: 'center' }}
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
