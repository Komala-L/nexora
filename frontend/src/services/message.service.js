const API_BASE_URL = "http://localhost:5000/api/v1";

export const sendMessage = async (
    conversationId,
    content
) => {
    const response = await fetch(
        `${API_BASE_URL}/messages/${conversationId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                content,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to send message"
        );
    }

    return data;
};

export const getMessages = async (
    conversationId,
    page = 1,
    limit = 20
) => {
    const response = await fetch(
        `${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${limit}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch messages"
        );
    }

    return data;
};