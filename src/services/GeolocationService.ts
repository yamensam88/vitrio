import { Coordinates } from "@/types";

export const GeolocationService = {
    /**
     * Get the current user position using the browser Geolocation API.
     * Returns a Promise that resolves with Coordinates.
     */
    getUserLocation: (): Promise<Coordinates> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    },

    /**
     * Calculates the distance (in km) between two coordinates using the Haversine formula.
     */
    calculateDistance: (start: Coordinates, end: Coordinates): number => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the earth in km

        const dLat = toRad(end.lat - start.lat);
        const dLon = toRad(end.lng - start.lng);
        const lat1 = toRad(start.lat);
        const lat2 = toRad(end.lat);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        return parseFloat(d.toFixed(1)); // Return distance rounded to 1 decimal place
    },
};
