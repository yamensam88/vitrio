"use client";

import { useEffect, useState } from "react";
import { getAdminGarages } from "@/lib/supabase-service";
import { getCurrentAdmin } from "@/lib/supabase-admin";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase";

type AdminGarage = Database['public']['Tables']['admin_garages']['Row'];

export default function DebugPage() {
    const [garages, setGarages] = useState<AdminGarage[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const admin = await getCurrentAdmin();
            if (!admin) {
                router.push('/admin/login');
                return;
            }
            loadData();
        } catch (error) {
            router.push('/admin/login');
        }
    }

    async function loadData() {
        try {
            const data = await getAdminGarages();
            setGarages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-10">Chargement...</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Debug: Intégrité des Données Partenaires</h1>
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Retour Dashboard
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID (Admin)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garage ID (Link)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnostic</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {garages.map((garage) => {
                            const isOrphan = garage.status === 'Actif' && !garage.garage_id;
                            const isMissingEmail = !garage.email;

                            return (
                                <tr key={garage.id} className={isOrphan ? "bg-red-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{garage.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{garage.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {garage.email ? (
                                            <span className="text-green-600">{garage.email}</span>
                                        ) : (
                                            <span className="text-red-500 font-bold">MANQUANT</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${garage.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {garage.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {garage.garage_id || <span className="text-gray-300">Null</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-4">
                                            {isOrphan && <span className="text-red-600 font-bold">⚠️ Lien manquant</span>}
                                            {isMissingEmail && <span className="text-red-600 font-bold">⚠️ Email manquant</span>}

                                            {!isOrphan && !isMissingEmail && garage.garage_id && (
                                                <>
                                                    <span className="text-green-500">OK</span>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Envoyer un email de test à ' + garage.email + ' ?')) return;
                                                            try {
                                                                const res = await fetch('/api/emails', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        type: 'test_partner_email',
                                                                        payload: { garageId: garage.garage_id }
                                                                    })
                                                                });
                                                                const data = await res.json();
                                                                if (res.ok) alert('Succès! Envoyé à: ' + data.sentTo);
                                                                else alert('Erreur: ' + data.error);
                                                            } catch (e) {
                                                                alert('Erreur réseau');
                                                            }
                                                        }}
                                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                                                    >
                                                        Test Email
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800">Comment réparer ?</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                    <li>Si <strong>Lien manquant</strong> : Le garage est "Actif" mais `garage_id` est vide. Il faut le supprimer et le recréer, ou mettre à jour la base de données manuellement.</li>
                    <li>Si <strong>Email manquant</strong> : L'email n'a pas été saisi lors de l'inscription.</li>
                </ul>
            </div>
        </div>
    );
}
