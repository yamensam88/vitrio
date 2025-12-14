import { useState, useMemo } from "react";
import { Coordinates } from "@/types";
import { GeolocationService } from "@/services/GeolocationService";
import { useApp } from "@/context/AppContext"; // Import Context

export type SortOption = "distance" | "price" | "availability";

export const useGarageSearch = () => {
    const { searchableGarages } = useApp(); // Use Context State
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [sortBy, setSortBy] = useState<SortOption[]>(["distance"]);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        const results = searchableGarages.map((garage) => { // Use real list
            // Calculate distance if location is available
            let distance = undefined;
            if (userLocation) {
                distance = GeolocationService.calculateDistance(
                    userLocation,
                    garage.coordinates
                );
            }
            return { ...garage, distance };
        });

        if (sortBy.length === 0) return results; // No sort

        // Global Min/Max for normalization
        const distances = results.map(g => g.distance || Infinity).filter(d => d !== Infinity);
        const minDist = Math.min(...distances);
        const maxDist = Math.max(...distances);

        const prices = results.map(g => Math.min(...g.offers.map(o => o.price)));
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
                const priceA = Math.min(...a.offers.map(o => o.price));
                const priceB = Math.min(...b.offers.map(o => o.price));
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
    }, [userLocation, sortBy]);

    return {
        garages: processedGarages,
        userLocation,
        loadingLocation,
        locateUser,
        sortBy,
        setSortBy,
        error,
    };
};
