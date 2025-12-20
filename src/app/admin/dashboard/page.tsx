"use client";

import { useEffect, useState } from "react";
import { getAdminGarages, updateAdminGarageStatus, generateAccessCodeForGarage, getAppointments, COMMISSION_RATE } from "@/lib/supabase-service";
import { getCurrentAdmin, signOutAdmin } from "@/lib/supabase-admin";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/supabase";

type AdminGarage = Database['public']['Tables']['admin_garages']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

export default function AdminDashboard() {
  const [adminGarages, setAdminGarages] = useState<AdminGarage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  const filteredAppointments = appointments.filter(app => {
    if (dateRange.start && app.date < dateRange.start) return false;
    if (dateRange.end && app.date > dateRange.end) return false;
    return true;
  });
  const [adminEmail, setAdminEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  async function checkAuthAndLoadData() {
    try {
      const admin = await getCurrentAdmin();
      if (!admin) {
        router.push('/admin/login');
        return;
      }
      setAdminEmail(admin.adminUser.email);
      await loadData();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/admin/login');
    }
  }

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

  async function handleLogout() {
    try {
      await signOutAdmin();
      // Clear cookies
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  async function handleGenerateCode(garageId: number) {
    try {
      const code = await generateAccessCodeForGarage(garageId);
      alert(`Code généré avec succès !\n\nCode d'accès : ${code}\n\nUn email a été envoyé au garage (voir console).`);
      await updateAdminGarageStatus(garageId, 'Actif');
      await loadData(); // Refresh
    } catch (error: any) {
      console.error('Error generating code:', error);
      alert(`Erreur lors de la génération du code: ${error?.message || 'Inconnue'}`);
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
  const totalConfirmed = appointments.filter(a => a.status === 'Confirmé').length;
  const totalCommissions = totalConfirmed * COMMISSION_RATE;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748B' }}>{adminEmail}</div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#EF4444',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              Déconnexion
            </button>
          </div>
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
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Commissions</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8B5CF6' }}>{totalCommissions}€</div>
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
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Offre</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Services</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Rdv Attente</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Rdv Confirmés</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Commissions</th>
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
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1E293B' }}>
                          {garage.offer_description || '-'}
                        </div>
                        {garage.offer_value !== null && garage.offer_value > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Val: {garage.offer_value}€</div>
                        )}
                      </td>

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

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: garageApps.filter(a => a.status === 'En attente').length > 0 ? '#FEF9C3' : '#F1F5F9',
                          color: garageApps.filter(a => a.status === 'En attente').length > 0 ? '#854D0E' : '#64748B',
                          fontWeight: 700
                        }}>
                          {garageApps.filter(a => a.status === 'En attente').length}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: confirmedApps > 0 ? '#DCFCE7' : '#F1F5F9',
                          color: confirmedApps > 0 ? '#166534' : '#64748B',
                          fontWeight: 700
                        }}>
                          {confirmedApps}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 700, color: '#8B5CF6' }}>
                        {confirmedApps * COMMISSION_RATE}€
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

        {/* Appointments Section */}
        <div className="card" style={{ marginTop: '2rem', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Liste des Rendez-vous</h2>

            {/* Date Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Période :</span>
              <input
                type="date"
                className="input-field"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <span style={{ color: '#64748B' }}>à</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Garage</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Client</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Véhicule / Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Coordonnées</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Montant / Offre</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(appt => {
                  const garage = adminGarages.find(g => g.garage_id === appt.garage_id);
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#1E293B' }}>
                        {new Date(appt.date).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                        {garage ? garage.name : 'Garage inconnu'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{appt.client_name}</div>
                        {appt.address && <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{appt.address}</div>}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 500 }}>{appt.plate || appt.vehicle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{appt.intervention_type || 'Pare-brise'}</div>
                        {appt.insurance_name && <div style={{ fontSize: '0.8rem', color: '#3B82F6' }}>{appt.insurance_name}</div>}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                        <div>📞 {appt.phone}</div>
                        <div style={{ color: '#64748B', fontSize: '0.8rem' }}>✉️ {appt.email}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{appt.amount}€</div>
                        {appt.offers && appt.offers[0] && (
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '4px' }}>
                            {appt.offers[0]}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: appt.status === 'En attente' ? '#FEF9C3' : appt.status === 'Confirmé' ? '#DCFCE7' : '#F1F5F9',
                          color: appt.status === 'En attente' ? '#854D0E' : appt.status === 'Confirmé' ? '#166534' : '#64748B'
                        }}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                      Aucun rendez-vous trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div >
  );
}
