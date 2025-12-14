"use client";

import { useApp } from "@/context/AppContext";

export default function AdminDashboard() {
  const { adminGarages, updateGarageStatus, appointments } = useApp();

  const pendingCount = adminGarages.filter(g => g.status === "En attente").length;
  const activeCount = adminGarages.filter(g => g.status === "Actif").length;

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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.85rem', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Garage</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ville</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Statut</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminGarages.map(garage => {
                // Analytics Logic
                const garageApps = appointments.filter(a => a.garageId === garage.garageId);
                const totalApps = garageApps.length;
                const confirmedApps = garageApps.filter(a => a.status === 'Confirmé').length;
                const billingAmount = confirmedApps * 50;

                return (
                  <tr key={garage.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                      {garage.name}
                      {garage.status === 'En attente' && (
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>• Action requise</div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748B' }}>{garage.city}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748B' }}>{garage.registrationDate}</td>

                    {/* Stats Columns */}
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 500 }}>{totalApps}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: '#10B981' }}>{confirmedApps}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {billingAmount > 0 ? `${billingAmount} €` : '-'}
                    </td>

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
                              onClick={() => updateGarageStatus(garage.id, 'Actif')}
                              title="Valider ce partenaire"
                              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                            >
                              ✓ Valider
                            </button>
                            <button
                              onClick={() => updateGarageStatus(garage.id, 'Suspendu')} // Treat as rejection
                              title="Refuser ce partenaire"
                              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                            >
                              ✕ Refuser
                            </button>
                          </>
                        )}
                        {garage.status === 'Actif' && (
                          <button
                            onClick={() => updateGarageStatus(garage.id, 'Suspendu')}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Suspendre
                          </button>
                        )}
                        {garage.status === 'Suspendu' && (
                          <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                            Rejeté / Suspendu
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
