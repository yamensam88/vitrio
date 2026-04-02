"use client";

import Link from "next/link";
import { useState } from "react";
import { useGarageSearch } from "@/hooks/useGarageSearch";
import { GarageCard } from "@/components/GarageCard";
import { FilterBar } from "@/components/FilterBar";
import { BookingModal } from "@/components/BookingModal";
import { Garage } from "@/types";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  const {
    garages,
    userLocation,
    loadingLocation,
    locateUser,
    sortBy,
    setSortBy,
    serviceFilters,
    setServiceFilters,
    error
  } = useGarageSearch();

  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [hoveredGarageId, setHoveredGarageId] = useState<string | null>(null);

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Navigation */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>Vitrio</div>
        <Link href="/pro" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Vous êtes garagiste ? <span style={{ color: 'var(--color-primary)' }}>Accès Pro &rarr;</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(circle at top right, rgba(0, 119, 255, 0.05), transparent 40%), radial-gradient(circle at top left, rgba(0, 208, 132, 0.05), transparent 40%)',
          padding: '6rem 1rem 3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <div className="container">
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            color: 'var(--color-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Comparez, réservez, <br /><span style={{ color: 'var(--color-text-main)' }}>c’est posé.</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            La première plateforme de confiance pour le vitrage automobile. <br />
            Trouvez un spécialiste vérifié près de chez vous en 2 minutes.
          </p>

          <button
            onClick={locateUser}
            disabled={loadingLocation}
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}
          >
            {loadingLocation ? 'Localisation en cours...' : '📍 Trouver les garages à proximité'}
          </button>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </p>
          )}

          {userLocation && (
            <p style={{ color: 'var(--color-secondary)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
              ✅ Localisation activée
            </p>
          )}
        </div>
      </section>

      {/* Main Content - SPLIT SCREEN */}
      <div className="container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Left Column: List */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          {/* Filters */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {garages.length} Experts disponibles
              </h2>
            </div>
            <FilterBar
              currentSort={sortBy}
              onSortChange={setSortBy}
              serviceFilters={serviceFilters}
              onServiceFilterChange={setServiceFilters}
              disabled={loadingLocation}
            />
          </div>

          {/* Results Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {garages.map((garage) => (
              <div
                key={garage.id}
                onMouseEnter={() => setHoveredGarageId(garage.id)}
                onMouseLeave={() => setHoveredGarageId(null)}
                style={{
                  transition: 'transform 0.2s',
                  transform: hoveredGarageId === garage.id ? 'translateY(-4px)' : 'none',
                  zIndex: hoveredGarageId === garage.id ? 10 : 1
                }}
              >
                <GarageCard
                  garage={garage}
                  onSelect={setSelectedGarage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Map */}
        <div style={{ flex: '1 1 400px', position: 'sticky', top: '1rem', height: 'calc(100vh - 2rem)', minHeight: '400px', display: 'flex' }}>
          <MapWrapper
            garages={garages}
            userLocation={userLocation}
            hoveredGarageId={hoveredGarageId}
            onGarageSelect={setSelectedGarage}
          />
        </div>

      </div>

      {selectedGarage && (
        <BookingModal
          garage={selectedGarage}
          onClose={() => setSelectedGarage(null)}
        />
      )}

    </main>
  );
}
