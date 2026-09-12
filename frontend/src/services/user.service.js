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

export const getCurrentUser = async () => {
    const response = await fetch(
        `${API_BASE_URL}/users/me`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch current user"
        );
    }

    return data;
};

export const updateProfile = async (profileData) => {
    const response = await fetch(
        `${API_BASE_URL}/users/profile`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(profileData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update profile"
        );
    }

    return data;
};

export const updateUserProfileImage = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
        `${API_BASE_URL}/users/profile/image`,
        {
            method: "PATCH",
            credentials: "include",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to update profile picture"
        );
    }

    return data;
};

export const removeUserProfileImage = async () => {
    const response = await fetch(
        `${API_BASE_URL}/users/profile/image`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to remove profile picture"
        );
    }

    return data;
};