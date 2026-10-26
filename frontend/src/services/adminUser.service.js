const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/v1`;

const adminFetch = async (path) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin data");
    }

    return data;
};

export const getAdminUsers = ({
    page = 1,
    limit = 10,
    search = "",
} = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
    });

    return adminFetch(`/admin/users?${params.toString()}`);
};

export const getAdminUserById = (userId) => {
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
        return Promise.reject(new Error("Invalid user ID."));
    }

    return adminFetch(
        `/admin/users/${encodeURIComponent(userId)}`
    );
};

export const getAdminDashboardStats = () => {
    return adminFetch("/admin/users/stats");
};

export const getAdminPlatformActivity = ({ days = 7 } = {}) => {
    const safeDays = Number(days) === 30 ? 30 : 7;

    return adminFetch(`/admin/users/activity?days=${safeDays}`);
};