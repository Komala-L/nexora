import {
    getCurrentLocation,
} from "../utils/location";

import {
    updateUserLocation,
} from "./user.service";

/**
 * Get the user's current browser location and update it on the Nexora backend.
 */
export const syncUserLocation = async () => {
    const {
        longitude,
        latitude,
    } = await getCurrentLocation();

    const response =
        await updateUserLocation(
            longitude,
            latitude
        );

    return {
        ...response,
        coordinates: {
            longitude,
            latitude,
        },
    };
};