"use client";

import dynamic from "next/dynamic";

// Dynamically import the map to avoid SSR issues with Leaflet 'window is not defined'
const GarageMap = dynamic(() => import("./GarageMap"), {
    ssr: false,
    loading: () => (
        <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#64748b", fontWeight: 600 }}>Chargement de la carte...</div>
        </div>
    )
});

export default GarageMap;
