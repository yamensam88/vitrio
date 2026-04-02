"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Garage } from "@/types";

// Fix Leaflet's default marker icon issue in Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const hoveredIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Helper component to center map when userLocation changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
}

interface GarageMapProps {
    garages: Garage[];
    userLocation: { lat: number; lng: number } | null;
    hoveredGarageId: string | null;
    onGarageSelect?: (garage: Garage) => void;
}

export default function GarageMap({ garages, userLocation, hoveredGarageId, onGarageSelect }: GarageMapProps) {
    // Default center to Paris if no user location and no garages
    let defaultCenter: [number, number] = [48.8566, 2.3522];
    let defaultZoom = 5;

    if (userLocation) {
        defaultCenter = [userLocation.lat, userLocation.lng];
        defaultZoom = 12;
    } else if (garages.length > 0) {
        // Average coordinates of garages if no user location
        const validGarages = garages.filter(g => g.coordinates && !isNaN(g.coordinates.lat) && !isNaN(g.coordinates.lng));
        if (validGarages.length > 0) {
            const sumLat = validGarages.reduce((sum, g) => sum + g.coordinates.lat, 0);
            const sumLng = validGarages.reduce((sum, g) => sum + g.coordinates.lng, 0);
            defaultCenter = [sumLat / validGarages.length, sumLng / validGarages.length];
            defaultZoom = 10;
        }
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: "100%", width: "100%", borderRadius: "12px", border: "1px solid #E2E8F0" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapController center={defaultCenter} zoom={defaultZoom} />

            {userLocation && (
                <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={new L.Icon({
                        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
                        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                    })}
                >
                    <Popup>
                        <div style={{ fontWeight: 600 }}>Votre position</div>
                    </Popup>
                </Marker>
            )}

            {garages.filter(g => g.coordinates?.lat && g.coordinates?.lng).map(garage => (
                <Marker
                    key={garage.id}
                    position={[garage.coordinates.lat, garage.coordinates.lng]}
                    icon={hoveredGarageId === garage.id ? hoveredIcon : customIcon}
                >
                    <Popup>
                        <div style={{ minWidth: "180px", cursor: 'pointer' }} onClick={() => onGarageSelect && onGarageSelect(garage)}>
                            <img
                                src={garage.image || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800'}
                                alt={garage.name}
                                style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.5rem" }}
                            />
                            <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{garage.name}</h3>
                            <p style={{ margin: "0 0 0.5rem", color: "#64748B", fontSize: "0.85rem" }}>{garage.city}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, color: "#10B981" }}>{garage.rating}⭐</span>
                                <span style={{ fontWeight: 700, color: "#3B82F6" }}>
                                    {garage.offers?.[0]?.price ? `${garage.offers[0].price}€` : 'Sur devis'}
                                </span>
                            </div>
                            <button
                                style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Voir les créneaux
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
