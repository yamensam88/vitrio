"use client";

import { useEffect, useState } from "react";
import { getAdminGarages, updateAdminGarageStatus, generateAccessCodeForGarage, getAppointments } from "@/lib/supabase-service";
import type { Database } from "@/lib/supabase";

type AdminGarage = Database['public']['Tables']['admin_garages']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

export default function AdminDashboard() {
  const [adminGarages, setAdminGarages] = useState<AdminGarage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [garagesData, appointmentsData] = await Promise.all([
        getAdminGarages(),
        getAppointments()
      ]);
      setAdminGarages(garagesData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCode(garageId: number) {
    try {
      const code = await generateAccessCodeForGarage(garageId);
      alert(`Code généré avec succès !\n\nCode d'accès : ${code}\n\nUn email a été envoyé au garage (voir console).`);
      await updateAdminGarageStatus(garageId, 'Actif');
      await loadData(); // Refresh
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Erreur lors de la génération du code');
    }
  }

  async function handleUpdateStatus(garageId: number, status: string) {
    try {
      await updateAdminGarageStatus(garageId, status);
      await loadData(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  const pendingCount = adminGarages.filter(g => g.status === "En attente").length;
  const activeCount = adminGarages.filter(g => g.status === "Actif").length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      {/* Top Bar */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>Vitrio <span style={{ color: '#ef4444', fontWeight: 400 }}>Admin</span></div>
          <div style={{ fontSize: '0.9rem', color: '#64748B' }}>Super Admin</div>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Administration</h1>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Partenaires</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>{adminGarages.length}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>En attente de validation</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{pendingCount}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Partenaires Actifs</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{activeCount}</div>
          </div>
        </div>

        {/* Garage List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Gestion des Partenaires</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Garage</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ville</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Services</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminGarages.map(garage => {
                  const garageApps = appointments.filter(a => a.garage_id === garage.garage_id);
                  const confirmedApps = garageApps.filter(a => a.status === 'Confirmé').length;

                  return (
                    <tr key={garage.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                        {garage.name}
                        {garage.status === 'En attente' && (
                          <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>• Action requise</div>
                        )}
                        {garage.generated_code && (
                          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: 4, fontFamily: 'monospace' }}>Code: {garage.generated_code}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748B' }}>{garage.city}</td>

                      {/* Services Column */}
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {garage.home_service && (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>
                              🏠 Domicile
                            </span>
                          )}
                          {garage.courtesy_vehicle && (
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>
                              🚗 Courtoisie
                            </span>
                          )}
                          {!garage.home_service && !garage.courtesy_vehicle && (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>-</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', color: '#64748B' }}>{garage.registration_date}</td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: garage.status === 'En attente' ? '#FEF9C3' : garage.status === 'Actif' ? '#DCFCE7' : '#FEE2E2',
                          color: garage.status === 'En attente' ? '#854D0E' : garage.status === 'Actif' ? '#166534' : '#991B1B'
                        }}>
                          {garage.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {garage.status === 'En attente' && (
                            <>
                              <button
                                onClick={() => handleGenerateCode(garage.id)}
                                title="Générer code et valider"
                                style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                              >
                                🔑 Générer Code
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(garage.id, 'Suspendu')}
                                title="Refuser ce partenaire"
                                style={{ padding: '0.4rem 0.8rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                              >
                                ✕ Refuser
                              </button>
                            </>
                          )}
                          {garage.status === 'Actif' && (
                            <button
                              onClick={() => handleUpdateStatus(garage.id, 'Suspendu')}
                              style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              Suspendre
                            </button>
                          )}
                          {garage.status === 'Suspendu' && (
                            <button
                              onClick={() => handleUpdateStatus(garage.id, 'Actif')}
                              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                            >
                              ↻ Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
