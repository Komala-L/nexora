const API_BASE_URL = "http://localhost:5000/api/v1";

export const getSettings = async () => {
    const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch settings"
        );
    }

    return data;
};

export const updateSettings = async (settingsData) => {
    const response = await fetch(
        `${API_BASE_URL}/settings`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(settingsData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update settings"
        );
    }

    return data;
};