import { useState, useMemo, useEffect } from "react";
import { Coordinates, Garage } from "@/types";
import { GeolocationService } from "@/services/GeolocationService";
import { getGarages } from "@/lib/supabase-service";

export type SortOption = "distance" | "price" | "availability";

export const useGarageSearch = () => {
    const [garages, setGarages] = useState<Garage[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [sortBy, setSortBy] = useState<SortOption[]>(["distance"]);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load garages from Supabase on mount
    useEffect(() => {
        async function loadGarages() {
            try {
                const data = await getGarages();
                setGarages(data as Garage[]);
            } catch (err) {
                console.error('Error loading garages:', err);
                setError("Erreur lors du chargement des garages");
            } finally {
                setLoading(false);
            }
        }
        loadGarages();
    }, []);

    // Function to trigger geolocation
    const locateUser = async () => {
        setLoadingLocation(true);
        setError(null);
        try {
            const location = await GeolocationService.getUserLocation();
            setUserLocation(location);
            setSortBy(["distance"]); // Default
        } catch (err) {
            console.error(err);
            setError("Impossible de vous géolocaliser. Vérifiez vos paramètres.");
        } finally {
            setLoadingLocation(false);
        }
    };

    // Helper to normalize values for scoring
    const normalize = (val: number, min: number, max: number) => {
        if (max === min) return 1;
        return (val - min) / (max - min);
    };

    // Main logic to process garages
    const processedGarages = useMemo(() => {
        const results = garages.map((garage) => {
            // Calculate distance if location is available
            let distance = undefined;
            if (userLocation) {
                distance = GeolocationService.calculateDistance(
                    userLocation,
                    { lat: garage.lat, lng: garage.lng }
                );
            }

            // Transform to match Garage interface
            return {
                id: garage.id,
                name: garage.name,
                address: garage.address,
                city: garage.city,
                coordinates: { lat: garage.lat, lng: garage.lng },
                rating: garage.rating,
                nextAvailability: garage.next_availability,
                image: garage.image || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800',
                distance,
                offers: [{
                    id: `default_${garage.id}`,
                    price: 120,
                    currency: 'EUR',
                    description: 'Remplacement Standard',
                    availability: garage.next_availability,
                    serviceDuration: 120
                }]
            } as Garage;
        });

        if (sortBy.length === 0) return results; // No sort

        // Global Min/Max for normalization
        const distances = results.map(g => g.distance || Infinity).filter(d => d !== Infinity);
        const minDist = Math.min(...distances);
        const maxDist = Math.max(...distances);

        const prices = results.map(g => g.offers.length > 0 ? Math.min(...g.offers.map(o => o.price)) : 100);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const times = results.map(g => new Date(g.nextAvailability).getTime());
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        // Score Calculation (Lower is better for all metrics, so we invert)
        results.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (sortBy.includes("distance")) {
                const distA = a.distance || maxDist; // Penalty if unknown
                const distB = b.distance || maxDist;
                scoreA += (1 - normalize(distA, minDist, maxDist)) * 40; // Weight: 40
                scoreB += (1 - normalize(distB, minDist, maxDist)) * 40;
            }

            if (sortBy.includes("price")) {
                const priceA = a.offers.length > 0 ? Math.min(...a.offers.map(o => o.price)) : 100;
                const priceB = b.offers.length > 0 ? Math.min(...b.offers.map(o => o.price)) : 100;
                scoreA += (1 - normalize(priceA, minPrice, maxPrice)) * 35; // Weight: 35
                scoreB += (1 - normalize(priceB, minPrice, maxPrice)) * 35;
            }

            if (sortBy.includes("availability")) {
                const timeA = new Date(a.nextAvailability).getTime();
                const timeB = new Date(b.nextAvailability).getTime();
                scoreA += (1 - normalize(timeA, minTime, maxTime)) * 25; // Weight: 25
                scoreB += (1 - normalize(timeB, minTime, maxTime)) * 25;
            }

            return scoreB - scoreA; // Descending score
        });

        return results;
    }, [garages, userLocation, sortBy]);

    return {
        garages: processedGarages,
        userLocation,
        loadingLocation: loadingLocation || loading,
        locateUser,
        sortBy,
        setSortBy,
        error,
    };
};
