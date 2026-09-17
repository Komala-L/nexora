const API_BASE_URL = "http://localhost:5000/api/v1";

export const getNotifications = async (
    page = 1,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch notifications"
        );
    }

    return data;
};


export const getUnreadNotificationCount = async () => {
    const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch unread notification count"
        );
    }

    return data;
};


export const markNotificationAsRead = async (
    notificationId
) => {
    const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to mark notification as read"
        );
    }

    return data;
};


export const markAllNotificationsAsRead = async () => {
    const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to mark all notifications as read"
        );
    }

    return data;
};