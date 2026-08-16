import crypto from "crypto";

const EARTH_RADIUS_KM = 6371;

const MIN_OFFSET_KM = 1;
const MAX_OFFSET_KM = 5;

/**
 * Generate a cryptographically random number
 * between the given minimum and maximum values.
 */
const randomBetween = (min, max) => {
    const randomBytes = crypto.randomBytes(4);

    const randomValue =
        randomBytes.readUInt32BE(0) / 0xFFFFFFFF;

    return min + randomValue * (max - min);
};

/**
 * Generate a privacy-protected location.
 *
 * The input and output coordinates follow GeoJSON format:
 * [longitude, latitude]
 *
 * The generated location is randomly displaced
 * approximately 1–5 km from the actual location
 * in a random direction.
 */
export const generateProtectedLocation = (
    longitude,
    latitude
) => {
    // Generate a random distance between 1 and 5 km.
    const distanceKm = randomBetween(
        MIN_OFFSET_KM,
        MAX_OFFSET_KM
    );

    // Generate a completely random direction.
    const bearing =
        randomBetween(0, 360) * Math.PI / 180;

    // Convert latitude and longitude to radians.
    const latitudeRadians =
        latitude * Math.PI / 180;

    const longitudeRadians =
        longitude * Math.PI / 180;

    // Convert distance to angular distance.
    const angularDistance =
        distanceKm / EARTH_RADIUS_KM;

    // Calculate protected latitude.
    const protectedLatitude = Math.asin(
        Math.sin(latitudeRadians) *
            Math.cos(angularDistance) +

        Math.cos(latitudeRadians) *
            Math.sin(angularDistance) *
            Math.cos(bearing)
    );

    // Calculate protected longitude.
    const protectedLongitude =
        longitudeRadians +
        Math.atan2(
            Math.sin(bearing) *
                Math.sin(angularDistance) *
                Math.cos(latitudeRadians),

            Math.cos(angularDistance) -
                Math.sin(latitudeRadians) *
                Math.sin(protectedLatitude)
        );

    // Convert back to degrees.
    const protectedLatitudeDegrees =
        protectedLatitude * 180 / Math.PI;

    const protectedLongitudeDegrees =
        ((protectedLongitude * 180 / Math.PI + 540) % 360) - 180;

    // GeoJSON coordinate order:
    // [longitude, latitude]
    return [
        protectedLongitudeDegrees,
        protectedLatitudeDegrees,
    ];
};