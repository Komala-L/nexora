import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    getMyConversations,
    createConversation,
} from "../../services/conversation.service.js";

import { getMyConnections } from "../../services/connection.service.js";
import { useAuth } from "../../context/AuthContext";

const Messages = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startingConversation, setStartingConversation] =
        useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        const fetchMessagesData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    conversationsResponse,
                    connectionsResponse,
                ] = await Promise.all([
                    getMyConversations(),
                    getMyConnections(),
                ]);

                setConversations(
                    conversationsResponse.data?.conversations || []
                );

                setConnections(
                    connectionsResponse.data?.connections || []
                );
            } catch (error) {
                setError(
                    error.message ||
                    "Failed to load messages"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMessagesData();
    }, [authLoading, user]);

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(
            (participant) =>
                String(participant._id) !==
                String(user?._id)
        );
    };

    const getExistingConversation = (userId) => {
        return conversations.find((conversation) =>
            conversation.participants.some(
                (participant) =>
                    String(participant._id) ===
                    String(userId)
            )
        );
    };

    const handleStartConversation = async (userId) => {
        try {
            setStartingConversation(userId);
            setError("");

            const data = await createConversation(userId);

            const conversation =
                data.data?.conversation;

            if (!conversation?._id) {
                throw new Error(
                    "Conversation could not be created"
                );
            }

            navigate(
                `/messages/${conversation._id}`
            );
        } catch (error) {
            setError(
                error.message ||
                "Failed to start conversation"
            );
        } finally {
            setStartingConversation(null);
        }
    };

    const messageUsers = [];

    conversations.forEach((conversation) => {
        const otherUser =
            getOtherParticipant(conversation);

        if (!otherUser) {
            return;
        }

        messageUsers.push({
            user: otherUser,
            conversation,
            hasConversation: true,
        });
    });

    connections.forEach((connection) => {
        const connectedUser = connection.user;

        if (!connectedUser) {
            return;
        }

        const existingConversation =
            getExistingConversation(
                connectedUser._id
            );

        if (!existingConversation) {
            messageUsers.push({
                user: connectedUser,
                conversation: null,
                hasConversation: false,
            });
        }
    });

    return (
        <div className="h-full p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Messages
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Your conversations and messages.
                </p>
            </div>

            {/* Loading */}
            {(authLoading || loading) && (
                <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-slate-500">
                        Loading conversations...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!loading &&
                !error &&
                messageUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                            <MessageCircle
                                size={26}
                                className="text-indigo-600"
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-slate-900">
                            No conversations yet
                        </h2>

                        <p className="mt-1 text-center text-sm text-slate-500">
                            Connect with someone to start a conversation.
                        </p>
                    </div>
                )}

            {/* Messages / Connections */}
            {!loading &&
                messageUsers.length > 0 && (
                    <div className="max-w-2xl space-y-3">
                        {messageUsers.map((item) => {
                            const {
                                user: otherUser,
                                conversation,
                                hasConversation,
                            } = item;

                            const isStarting =
                                startingConversation ===
                                otherUser._id;

                            return (
                                <button
                                    key={conversation?._id || otherUser._id}
                                    type="button"
                                    disabled={isStarting}
                                    onClick={() => {
                                        if (
                                            hasConversation
                                        ) {
                                            navigate(
                                                `/messages/${conversation._id}`
                                            );
                                        } else {
                                            handleStartConversation(
                                                otherUser._id
                                            );
                                        }
                                    }}
                                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {/* Avatar */}
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                                        {otherUser.profilePic?.url ? (
                                            <img
                                                src={
                                                    otherUser
                                                        .profilePic
                                                        .url
                                                }
                                                alt={
                                                    otherUser.name
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            otherUser.name
                                                ?.charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>

                                    {/* User information */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-semibold text-slate-900">
                                            {otherUser.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {isStarting
                                                ? "Starting conversation..."
                                                : hasConversation
                                                    ? "Open conversation"
                                                    : "Start a conversation"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
        </div>
    );
};

export default Messages;