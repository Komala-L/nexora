import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getConversation } from "../../services/conversation.service.js";
import {
    getMessages,
    sendMessage,
} from "../../services/message.service.js";
import { useAuth } from "../../context/AuthContext";

const Chat = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const shouldAutoScrollRef = useRef(true);

    useEffect(() => {
        const fetchChat = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    conversationResponse,
                    messagesResponse,
                ] = await Promise.all([
                    getConversation(conversationId),
                    getMessages(conversationId),
                ]);

                setConversation(
                    conversationResponse.data?.conversation || null
                );

                setMessages(
                    messagesResponse.data?.messages || []
                );

                // When opening a conversation,
                // start at the latest message.
                shouldAutoScrollRef.current = true;
            } catch (error) {
                setError(
                    error.message ||
                    "Failed to load conversation"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchChat();
    }, [conversationId]);

    useEffect(() => {
        if (
            !loading &&
            shouldAutoScrollRef.current
        ) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [messages, loading]);

    const handleMessagesScroll = () => {
        const container =
            messagesContainerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldAutoScrollRef.current =
            distanceFromBottom < 120;
    };

    const otherParticipant =
        conversation?.participants?.find(
            (participant) =>
                String(participant._id) !==
                String(user?._id)
        );

    const formatMessageTime = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent || sending) {
            return;
        }

        try {
            setSending(true);
            setError("");

            shouldAutoScrollRef.current = true;

            const data = await sendMessage(
                conversationId,
                trimmedContent
            );

            const newMessage =
                data.data?.message;

            if (newMessage) {
                setMessages((previousMessages) => [
                    ...previousMessages,
                    newMessage,
                ]);
            }

            setContent("");
        } catch (error) {
            setError(
                error.message ||
                "Failed to send message"
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading conversation...
                </p>
            </div>
        );
    }

    if (error && !conversation) {
        return (
            <div className="p-6">
                <button
                    onClick={() =>
                        navigate("/messages")
                    }
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={18} />
                    Back to Messages
                </button>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">

            {/* Chat Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-4">
                <button
                    onClick={() =>
                        navigate("/messages")
                    }
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Back to messages"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Profile picture */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {otherParticipant?.profilePic.url ? (
                        <img
                            src={otherParticipant.profilePic.url}
                            alt={otherParticipant.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        otherParticipant?.name
                            ?.charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div>
                    <h1 className="font-semibold text-slate-900">
                        {otherParticipant?.name}
                    </h1>

                    <p className="text-xs text-slate-500">
                        Connected
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6"
            >
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-slate-500">
                            No messages yet. Start the
                            conversation.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map((message) => {
                            const isOwnMessage =
                                String(
                                    message.sender?._id
                                ) ===
                                String(user?._id);

                            return (
                                <div
                                    key={message._id}
                                    className={`flex ${
                                        isOwnMessage
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                                            isOwnMessage
                                                ? "rounded-br-md bg-indigo-600 text-white"
                                                : "rounded-bl-md bg-white text-slate-900 shadow-sm"
                                        }`}
                                    >
                                        <div className="flex items-end gap-3">
                                            <span className="break-words">
                                                {
                                                    message.content
                                                }
                                            </span>

                                            <span
                                                className={`shrink-0 text-[10px] ${
                                                    isOwnMessage
                                                        ? "text-indigo-100"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {formatMessageTime(
                                                    message.createdAt
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Scroll target */}
                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="shrink-0 border-t border-red-100 bg-red-50 px-6 py-2">
                    <p className="text-xs text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* Message Input */}
            <form
                onSubmit={handleSendMessage}
                className="shrink-0 border-t border-slate-200 bg-white p-4"
            >
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        placeholder="Type a message..."
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />

                    <button
                        type="submit"
                        disabled={
                            sending ||
                            !content.trim()
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;