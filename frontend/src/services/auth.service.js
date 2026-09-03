const API_BASE_URL = "http://localhost:5000/api/v1";

export const registerUser = async (userData) => {
    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(userData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Registration failed"
        );
    }

    return data;
};

export const loginUser = async (credentials) => {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
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
            data.message || "Login failed"
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

export const logoutUser = async () => {
    const response = await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Logout failed"
        );
    }

    return data;
};