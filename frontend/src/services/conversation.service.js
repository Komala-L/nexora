const API_BASE_URL = "http://localhost:5000/api/v1";

export const createConversation = async (userId) => {
    const response = await fetch(
        `${API_BASE_URL}/conversations/${userId}`,
        {
            method: "POST",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create conversation"
        );
    }

    return data;
};

export const getMyConversations = async (
    page = 1,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE_URL}/conversations?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch conversations"
        );
    }

    return data;
};

export const getConversation = async (
    conversationId
) => {
    const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch conversation"
        );
    }

    return data;
};