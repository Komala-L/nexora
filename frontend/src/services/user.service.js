const API_BASE_URL = "http://localhost:5000/api/v1";

export const getNearbyUsers = async (limit = 10) => {
    const response = await fetch(
        `${API_BASE_URL}/users/nearby?limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch nearby users"
        );
    }

    return data;
};

export const discoverUsers = async (
    type,
    limit = 10,
    radius = 10
) => {
    const params = new URLSearchParams({
        type,
        limit: String(limit),
        radius: String(radius),
    });

    const response = await fetch(
        `${API_BASE_URL}/users/discover?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to discover users"
        );
    }

    return data;
};

export const updateUserLocation = async (longitude, latitude) => {
    const response = await fetch(
        `${API_BASE_URL}/users/location`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                longitude,
                latitude,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update location"
        );
    }

    return data;
};

export const getUserProfile = async (userId) => {
    const response = await fetch(
        `${API_BASE_URL}/users/${userId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch user profile"
        );
    }

    return data;
};