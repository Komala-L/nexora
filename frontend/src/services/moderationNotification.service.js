const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/v1`;

const moderationRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const getMyModerationNotices = async () => {
    const data = await moderationRequest("/users/moderation-notices");
    return data.data;
};

export const acknowledgeModerationNotice = async (noticeId) => {
    const data = await moderationRequest(
        `/users/moderation-notices/${noticeId}/acknowledge`,
        { method: "PATCH" }
    );

    return data.data;
};