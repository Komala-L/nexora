const API_BASE_URL = "http://localhost:5000/api/v1";

/**
 * Admin login
 */
export const loginAdmin = async (credentials) => {
    const response = await fetch(
        `${API_BASE_URL}/admin/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(credentials),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Admin login failed"
        );
    }

    return data;
};

/**
 * Get the currently authenticated admin
 */
export const getCurrentAdmin = async () => {
    const response = await fetch(
        `${API_BASE_URL}/admin/auth/me`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch current admin"
        );
    }

    return data;
};

/**
 * Admin logout
 */
export const logoutAdmin = async () => {
    const response = await fetch(
        `${API_BASE_URL}/admin/auth/logout`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Admin logout failed"
        );
    }

    return data;
};