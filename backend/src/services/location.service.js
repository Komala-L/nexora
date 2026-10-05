const OPENCAGE_BASE_URL =
    "https://api.opencagedata.com/geocode/v1/json";

/**
 * Reverse geocode coordinates into a readable location.
 */
export const reverseGeocode = async (
    longitude,
    latitude
) => {
    if (
        typeof longitude !== "number" ||
        typeof latitude !== "number"
    ) {
        throw new Error(
            "Valid longitude and latitude are required."
        );
    }

    const apiKey =
        process.env.OPENCAGE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OpenCage API key is not configured."
        );
    }

    const url = new URL(
        OPENCAGE_BASE_URL
    );

    url.searchParams.set(
        "q",
        `${latitude},${longitude}`
    );

    url.searchParams.set(
        "key",
        apiKey
    );

    url.searchParams.set(
        "language",
        "en"
    );

    url.searchParams.set(
        "limit",
        "1"
    );

    const response = await fetch(
        url.toString()
    );

    if (!response.ok) {
        throw new Error(
            `Reverse geocoding failed with status ${response.status}.`
        );
    }

    const data =
        await response.json();

    const result =
        data?.results?.[0];

    if (!result) {
        throw new Error(
            "Unable to determine the location."
        );
    }

    const components = result.components || {};

    const area =
        components.suburb ||
        components.neighbourhood ||
        components.quarter ||
        components.town ||
        components.village ||
        null;

    const city =
        components.city ||
        components.town ||
        components.municipality ||
        components.county ||
        components.state_district ||
        null;

    return {
        area,
        city,
    };
};