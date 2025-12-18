"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGarageByAccessCode } from '@/lib/supabase-service';
import Link from 'next/link';

export default function PartnerLogin() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        const savedCode = localStorage.getItem('partner_access_code');
        if (savedCode) {
            router.push('/pro/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const garage = await getGarageByAccessCode(code);
            if (garage) {
                if (garage.admin_garages.status !== 'Actif') {
                    setError("Votre compte est actuellement suspendu. Veuillez contacter l'administration.");
                    return;
                }
                localStorage.setItem('partner_access_code', code);
                router.push('/pro/dashboard');
            } else {
                setError("Code invalide. Veuillez vérifier votre code d'accès.");
            }
        } catch (err) {
            setError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Espace Partenaire
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Connectez-vous pour gérer vos rendez-vous
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Code d'accès
                            </label>
                            <div className="mt-1">
                                <input
                                    id="code"
                                    name="code"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Entrez votre code confidentiel"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Se connecter
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
