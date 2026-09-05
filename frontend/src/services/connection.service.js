const API_BASE_URL = "http://localhost:5000/api/v1";

export const sendConnectionRequest = async (userId) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/${userId}`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to send connection request"
        );
    }

    return data;
};

export const getMyConnections = async (page = 1, limit = 20) => {
    const response = await fetch(
        `${API_BASE_URL}/connections?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch connections"
        );
    }

    return data;
};

export const getReceivedConnectionRequests = async (
    page = 1,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/received?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch received connection requests"
        );
    }

    return data;
};

export const getSentConnectionRequests = async (
    page = 1,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/sent?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch sent connection requests"
        );
    }

    return data;
};

export const acceptConnectionRequest = async (
    connectionId
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/${connectionId}/accept`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to accept connection request"
        );
    }

    return data;
};

export const rejectConnectionRequest = async (
    connectionId
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/${connectionId}/reject`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to reject connection request"
        );
    }

    return data;
};

export const cancelConnectionRequest = async (
    connectionId
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/requests/${connectionId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to cancel connection request"
        );
    }

    return data;
};

export const removeConnection = async (
    connectionId
) => {
    const response = await fetch(
        `${API_BASE_URL}/connections/${connectionId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to remove connection"
        );
    }

    return data;
};