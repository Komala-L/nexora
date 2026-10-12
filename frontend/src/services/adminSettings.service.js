const API_BASE_URL = "http://localhost:5000/api/v1";

const adminSettingsFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Admin settings request failed.");
    }

    return data;
};

export const getAdminSettings = () => {
    return adminSettingsFetch("/admin/settings");
};

export const updateAdminSettings = (settings) => {
    return adminSettingsFetch("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
    });
};