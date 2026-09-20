const API_BASE_URL = "http://localhost:5000/api/v1";

export const changePassword = async (passwordData) => {
    const response = await fetch(
        `${API_BASE_URL}/security/password`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(passwordData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to change password"
        );
    }

    return data;
};