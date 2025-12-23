"use client";

import { useEffect, useState } from "react";
import { getAdminGarages, getAppointments } from "@/lib/supabase-service";

export default function DebugPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadDebugData();
    }, []);

    async function loadDebugData() {
        const [garages, appointments] = await Promise.all([
            getAdminGarages(),
            getAppointments()
        ]);

        const debug = {
            garages: garages.map(g => ({
                id: g.id,
                name: g.name,
                garage_id: g.garage_id,
                status: g.status
            })),
            appointments: appointments.map(a => ({
                id: a.id,
                client_name: a.client_name,
                garage_id: a.garage_id,
                status: a.status
            })),
            matching: garages.map(g => {
                const matches = appointments.filter(a => a.garage_id === g.garage_id);
                return {
                    garage_name: g.name,
                    garage_id: g.garage_id,
                    matched_appointments: matches.length,
                    appointment_ids: matches.map(m => m.id)
                };
            })
        };

        setData(debug);
    }

    if (!data) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <h1>Debug Data Synchronization</h1>

            <h2>Admin Garages ({data.garages.length})</h2>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
                {JSON.stringify(data.garages, null, 2)}
            </pre>

            <h2>Appointments ({data.appointments.length})</h2>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
                {JSON.stringify(data.appointments, null, 2)}
            </pre>

            <h2>Matching Results</h2>
            <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
                {JSON.stringify(data.matching, null, 2)}
            </pre>
        </div>
    );
}
