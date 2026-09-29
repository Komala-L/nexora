import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Send,
    ImageIcon,
    LinkIcon,
    Paperclip,
    Image,
    FileText,
    X,
} from "lucide-react";

import { socket } from "../../socket/socket";
import { useNavigate, useParams } from "react-router-dom";

import { getConversation } from "../../services/conversation.service.js";
import {
    getMessages,
    sendMessage,
    uploadMessageAttachment,
} from "../../services/message.service.js";

import { getUserPresence } from "../../services/user.service.js";
import { useAuth } from "../../context/AuthContext";

const Chat = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
    const [lastSeenAt, setLastSeenAt] = useState(null);
    
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

    const [showSharedContent, setShowSharedContent] = useState(false);
    const [sharedContentTab, setSharedContentTab] = useState("pictures");

    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const imageInputRef = useRef(null);
    const documentInputRef = useRef(null);

    const shouldAutoScrollRef = useRef(true);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    /*
     * --------------------------------------------------
     * NEW MESSAGE SOCKET LISTENER
     * --------------------------------------------------
     */
    useEffect(() => {
        const handleNewMessage = (message) => {
            if (
                String(message.conversation) !==
                String(conversationId)
            ) {
                return;
            }

            setMessages((previousMessages) => {
                const alreadyExists =
                    previousMessages.some(
                        (existingMessage) =>
                            String(existingMessage._id) ===
                            String(message._id)
                    );

                if (alreadyExists) {
                    return previousMessages;
                }

                return [...previousMessages, message];
            });

            shouldAutoScrollRef.current = true;
        };

        socket.on("new-message", handleNewMessage);

        return () => {
            socket.off(
                "new-message",
                handleNewMessage
            );
        };
    }, [conversationId]);

    /*
    * --------------------------------------------------
    * MESSAGE DELIVERED SOCKET LISTENER
    * --------------------------------------------------
    */
    useEffect(() => {
        const handleMessageDelivered = ({
        messageId,
    }) => {
        if (!messageId) {
            return;
        }

        setMessages((previousMessages) =>
            previousMessages.map((message) =>
                String(message._id) ===
                String(messageId)
                    ? {
                        ...message,
                        deliveredAt:
                            new Date().toISOString(),
                    }
                    : message
            )
        );
    };
        socket.on(
            "message-delivered",
            handleMessageDelivered
        );

        return () => {
            socket.off(
                "message-delivered",
                handleMessageDelivered
            );
        };
    }, []);

    /*
    * --------------------------------------------------
    * MESSAGE READ SOCKET LISTENER
    * --------------------------------------------------
    */
    useEffect(() => {
        const handleMessageRead = ({
            messageId,
            readAt,
        }) => {
            if (!messageId) {
                return;
            }

            setMessages((previousMessages) =>
                previousMessages.map((message) =>
                    String(message._id) ===
                    String(messageId)
                        ? {
                            ...message,
                            readAt:
                                readAt || new Date(),
                        }
                        : message
                )
            );
        };

        socket.on(
            "message-read",
            handleMessageRead
        );

        return () => {
            socket.off(
                "message-read",
                handleMessageRead
            );
        };
    }, []);

    /*
    * --------------------------------------------------
    * MARK INCOMING MESSAGES AS READ
    * --------------------------------------------------
    */
    useEffect(() => {
        if (
            loading ||
            !user ||
            !conversationId ||
            messages.length === 0
        ) {
            return;
        }

        messages.forEach((message) => {
            const isOwnMessage =
                String(message.sender?._id) ===
                String(user._id);

            if (
                !isOwnMessage &&
                !message.readAt
            ) {
                socket.emit("message-read", {
                    messageId: message._id,
                });
            }
        });
    }, [
        messages,
        loading,
        user,
        conversationId,
    ]);

    /*
     * --------------------------------------------------
     * FETCH CONVERSATION + MESSAGES
     * --------------------------------------------------
     */
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
                    conversationResponse.data
                        ?.conversation || null
                );

                setMessages(
                    messagesResponse.data?.messages || []
                );

                // Start at the latest message.
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

    /*
     * --------------------------------------------------
     * AUTO SCROLL
     * --------------------------------------------------
     */
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

    /*
     * --------------------------------------------------
     * MESSAGE SCROLL HANDLER
     * --------------------------------------------------
     */
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

    /*
     * --------------------------------------------------
     * FIND THE OTHER PARTICIPANT
     * --------------------------------------------------
     */
    const otherParticipant =
        conversation?.participants?.find(
            (participant) =>
                String(participant._id) !==
                String(user?._id)
        );

    /*
    * --------------------------------------------------
    * USER PRESENCE
    * --------------------------------------------------
    */
    useEffect(() => {
        if (!otherParticipant?._id) {
            return;
        }

        const otherUserId =
            String(otherParticipant._id);

        let isMounted = true;

        const handleUserOnline = ({ userId }) => {
            if (String(userId) !== otherUserId) {
                return;
            }

            setIsOtherUserOnline(true);
            setLastSeenAt(null);
        };

        const handleUserOffline = ({
            userId,
            lastSeenAt,
        }) => {
            if (String(userId) !== otherUserId) {
                return;
            }

            setIsOtherUserOnline(false);
            setLastSeenAt(lastSeenAt || null);
        };

        const handlePresenceState = ({
            onlineUserIds,
        }) => {
            if (!Array.isArray(onlineUserIds)) {
                return;
            }

            const isOnline =
                onlineUserIds.some(
                    (id) =>
                        String(id) === otherUserId
                );

            if (isOnline) {
                setIsOtherUserOnline(true);
                setLastSeenAt(null);
            } else {
                setIsOtherUserOnline(false);
            }
        };

        socket.on(
            "user-online",
            handleUserOnline
        );

        socket.on(
            "user-offline",
            handleUserOffline
        );

        socket.on(
            "presence-state",
            handlePresenceState
        );

        const fetchPresence = async () => {
            try {
                const response =
                    await getUserPresence(
                        otherParticipant._id
                    );

                if (!isMounted) {
                    return;
                }

                const presence =
                    response.data?.presence;

                setIsOtherUserOnline(
                    Boolean(presence?.isOnline)
                );

                setLastSeenAt(
                    presence?.lastSeenAt || null
                );
            } catch (error) {
                console.error(
                    "Failed to fetch user presence:",
                    error
                );
            }
        };

        fetchPresence();

        return () => {
            isMounted = false;

            socket.off(
                "user-online",
                handleUserOnline
            );

            socket.off(
                "user-offline",
                handleUserOffline
            );

            socket.off(
                "presence-state",
                handlePresenceState
            );
        };
    }, [otherParticipant?._id]);

    /*
    * --------------------------------------------------
    * OTHER USER PRESENCE
    * --------------------------------------------------
    */
    useEffect(() => {
        if (!otherParticipant?._id) {
            return;
        }

        const otherUserId = String(
            otherParticipant._id
        );

        const handleUserOnline = ({ userId }) => {
            if (String(userId) !== otherUserId) {
                return;
            }

            setIsOtherUserOnline(true);
            setLastSeenAt(null);
        };

        const handleUserOffline = ({
            userId,
            lastSeenAt,
        }) => {
            if (String(userId) !== otherUserId) {
                return;
            }

            setIsOtherUserOnline(false);
            setLastSeenAt(lastSeenAt);
        };

        socket.on(
            "user-online",
            handleUserOnline
        );

        socket.on(
            "user-offline",
            handleUserOffline
        );

        const fetchPresence = async () => {
            try {
                const response =
                    await getUserPresence(
                        otherUserId
                    );

                const presence =
                    response.data?.presence;

                setIsOtherUserOnline(
                    presence?.isOnline || false
                );

                setLastSeenAt(
                    presence?.lastSeenAt || null
                );
            } catch (error) {
                console.error(
                    "Failed to fetch user presence:",
                    error
                );
            }
        };

        fetchPresence();

        return () => {
            socket.off(
                "user-online",
                handleUserOnline
            );

            socket.off(
                "user-offline",
                handleUserOffline
            );
        };
    }, [otherParticipant?._id]);

    /*
    * --------------------------------------------------
    * TYPING INDICATOR
    * --------------------------------------------------
    */
    useEffect(() => {
        if (!otherParticipant?._id) {
            return;
        }

        const otherUserId = String(
            otherParticipant._id
        );

        const handleUserTyping = ({
            userId,
            conversationId: typingConversationId,
            isTyping,
        }) => {
            if (
                String(userId) !== otherUserId ||
                String(typingConversationId) !==
                    String(conversationId)
            ) {
                return;
            }

            setIsOtherUserTyping(Boolean(isTyping));
        };

        socket.on(
            "user-typing",
            handleUserTyping
        );

        return () => {
            socket.off(
                "user-typing",
                handleUserTyping
            );

            setIsOtherUserTyping(false);
        };
    }, [
        otherParticipant?._id,
        conversationId,
    ]);

    /*
     * --------------------------------------------------
     * DEBUG SOCKET STATUS
     * --------------------------------------------------
     */
    useEffect(() => {
        console.log(
            "CHAT SOCKET STATUS:",
            socket.connected
        );

        const handleConnect = () => {
            console.log(
                "CHAT SOCKET CONNECTED:",
                socket.id
            );
        };

        const handleDisconnect = (reason) => {
            console.log(
                "CHAT SOCKET DISCONNECTED:",
                reason
            );
        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );
        };
    }, []);

    /*
     * --------------------------------------------------
     * FORMAT MESSAGE TIME
     * --------------------------------------------------
     */
    const formatMessageTime = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    const renderMessageAttachments = (message) => {
        if (
            !Array.isArray(message.attachments) ||
            message.attachments.length === 0
        ) {
            return null;
        }

        return (
            <div className="mt-2 space-y-2">
                {message.attachments.map(
                    (attachment, index) => {
                        if (message.type === "image") {
                            return (
                                <a
                                    key={`${message._id}-attachment-${index}`}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                    className="block overflow-hidden rounded-xl"
                                >
                                    <img
                                        src={attachment.url}
                                        alt={
                                            attachment.fileName ||
                                            "Shared image"
                                        }
                                        className="max-h-80 max-w-full rounded-xl object-cover transition hover:opacity-95"
                                    />
                                </a>
                            );
                        }

                        return (
                            <a
                                key={`${message._id}-attachment-${index}`}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                    message.sender?._id ===
                                    user?._id
                                        ? "border-white/20 bg-white/10 hover:bg-white/15"
                                        : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                        message.sender?._id ===
                                        user?._id
                                            ? "bg-white/15"
                                            : "bg-indigo-100"
                                    }`}
                                >
                                    <FileText
                                        size={20}
                                        className={
                                            message.sender?._id ===
                                            user?._id
                                                ? "text-white"
                                                : "text-indigo-600"
                                        }
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`truncate text-sm font-medium ${
                                            message.sender?._id ===
                                            user?._id
                                                ? "text-white"
                                                : "text-slate-800"
                                        }`}
                                    >
                                        {attachment.fileName ||
                                            "Document"}
                                    </p>

                                    <p
                                        className={`mt-0.5 text-[11px] ${
                                            message.sender?._id ===
                                            user?._id
                                                ? "text-indigo-100"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {attachment.mimeType ||
                                            "Document"}
                                    </p>
                                </div>
                            </a>
                        );
                    }
                )}
            </div>
        );
    };

    const renderMessageContent = (text) => {
        if (!text) {
            return null;
        }

        const urlRegex =
            /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            const isUrl =
                /^https?:\/\//i.test(part) ||
                /^www\./i.test(part);

            if (!isUrl) {
                return (
                    <span key={index}>
                        {part}
                    </span>
                );
            }

            const href = /^www\./i.test(part)
                ? `https://${part}`
                : part;

            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                    className="break-all underline underline-offset-2 hover:opacity-80"
                >
                    {part}
                </a>
            );
        });
    };

    /*
     * --------------------------------------------------
     * FORMAT LAST SEEN
     * --------------------------------------------------
     */
    const formatLastSeen = (date) => {
        if (!date) {
            return "recently";
        }

        const lastSeen = new Date(date);
        const now = new Date();

        const isToday =
            lastSeen.toDateString() ===
            now.toDateString();

        if (isToday) {
            return `today at ${lastSeen.toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit",
                }
            )}`;
        }

        return (
            lastSeen.toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
            }) +
            " at " +
            lastSeen.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            })
        );
    };

    /*
     * --------------------------------------------------
     * SHARED CONTENT
     * --------------------------------------------------
     */
    const sharedPictures = messages.filter(
        (message) =>
            message.type === "image" &&
            Array.isArray(message.attachments) &&
            message.attachments.length > 0
    );

    const sharedDocuments = messages.filter(
        (message) =>
            message.type === "document" &&
            Array.isArray(message.attachments) &&
            message.attachments.length > 0
    );

    const sharedLinks = messages.flatMap((message) => {
        if (
            message.type !== "text" ||
            !message.content
        ) {
            return [];
        }

        const urlRegex =
            /https?:\/\/[^\s]+/g;

        const urls =
            message.content.match(urlRegex);

        if (!urls) {
            return [];
        }

        return urls.map((url) => ({
            url,
            messageId: message._id,
            createdAt: message.createdAt,
        }));
    });

    /*
    * --------------------------------------------------
    * TYPING EVENTS
    * --------------------------------------------------
    */
    const emitTypingStart = () => {
        if (
            !otherParticipant?._id ||
            !conversationId
        ) {
            return;
        }

        if (!isTypingRef.current) {
            isTypingRef.current = true;

            socket.emit("typing-start", {
                conversationId,
                recipientId: otherParticipant._id,
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(
                typingTimeoutRef.current
            );
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTypingStop();
        }, 800);
    };

    const emitTypingStop = () => {
        if (
            !isTypingRef.current ||
            !conversationId ||
            !otherParticipant?._id
        ) {
            return;
        }

        isTypingRef.current = false;

        socket.emit("typing-stop", {
            conversationId,
            recipientId: otherParticipant._id,
        });

        if (typingTimeoutRef.current) {
            clearTimeout(
                typingTimeoutRef.current
            );

            typingTimeoutRef.current = null;
        }
    };

    const handleFileSelected = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");

        setSelectedFile(file);

        // Allow selecting the same file again later.
        event.target.value = "";
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
    };

    /*
     * --------------------------------------------------
     * SEND MESSAGE
     * --------------------------------------------------
     */
    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (sending || uploadingAttachment) {
            return;
        }

        emitTypingStop();

        try {
            setError("");

            /*
            * --------------------------------------------------
            * SEND ATTACHMENT + OPTIONAL TEXT
            * --------------------------------------------------
            */
            if (selectedFile) {
                setUploadingAttachment(true);
                shouldAutoScrollRef.current = true;

                const uploadResponse =
                    await uploadMessageAttachment(
                        selectedFile
                    );

                const attachment =
                    uploadResponse.data?.attachment;

                if (!attachment) {
                    throw new Error(
                        "Attachment upload failed"
                    );
                }

                const fileType =
                    selectedFile.type.startsWith("image/")
                        ? "image"
                        : "document";

                const messageResponse =
                    await sendMessage(
                        conversationId,
                        content.trim(),
                        {
                            type: fileType,
                            attachments: [attachment],
                        }
                    );

                const newMessage =
                    messageResponse.data?.message;

                if (newMessage) {
                    setMessages(
                        (previousMessages) => [
                            ...previousMessages,
                            newMessage,
                        ]
                    );
                }

                // Clear both attachment and text
                setSelectedFile(null);
                setContent("");

                return;
            }

            /*
            * --------------------------------------------------
            * SEND TEXT MESSAGE
            * --------------------------------------------------
            */

            const trimmedContent =
                content.trim();

            if (!trimmedContent) {
                return;
            }

            setSending(true);
            shouldAutoScrollRef.current = true;

            const data = await sendMessage(
                conversationId,
                trimmedContent
            );

            const newMessage =
                data.data?.message;

            if (newMessage) {
                setMessages(
                    (previousMessages) => [
                        ...previousMessages,
                        newMessage,
                    ]
                );
            }

            setContent("");

        } catch (error) {
            setError(
                error.message ||
                "Failed to send message"
            );
        } finally {
            setSending(false);
            setUploadingAttachment(false);
        }
    };

    /*
     * --------------------------------------------------
     * LOADING STATE
     * --------------------------------------------------
     */
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading conversation...
                </p>
            </div>
        );
    }

    /*
     * --------------------------------------------------
     * ERROR STATE
     * --------------------------------------------------
     */
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

    /*
     * --------------------------------------------------
     * CHAT UI
     * --------------------------------------------------
     */
    return (
        <div className="flex h-full min-h-0 flex-col">

            {showSharedContent ? (
                <div className="flex h-full min-h-0 flex-col bg-slate-50">

                    {/* Shared Content Header */}
                    <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-4">

                        <button
                            type="button"
                            onClick={() =>
                                setShowSharedContent(false)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Back to chat"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <h1 className="font-semibold text-slate-900">
                                Shared Content
                            </h1>

                            <p className="text-xs text-slate-500">
                                {otherParticipant?.name}
                            </p>
                        </div>

                    </div>

                    {/* Shared Content Tabs */}
                    <div className="shrink-0 border-b border-slate-200 bg-white px-6">

                        <div className="flex gap-6">

                            {/* Pictures */}
                            <button
                                type="button"
                                onClick={() =>
                                    setSharedContentTab(
                                        "pictures"
                                    )
                                }
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition ${
                                    sharedContentTab ===
                                    "pictures"
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <ImageIcon size={17} />

                                Pictures

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                    {sharedPictures.length}
                                </span>
                            </button>

                            {/* Documents */}
                            <button
                                type="button"
                                onClick={() =>
                                    setSharedContentTab(
                                        "docs"
                                    )
                                }
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition ${
                                    sharedContentTab ===
                                    "docs"
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <FileText size={17} />

                                Docs

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                    {sharedDocuments.length}
                                </span>
                            </button>

                            {/* Links */}
                            <button
                                type="button"
                                onClick={() =>
                                    setSharedContentTab(
                                        "links"
                                    )
                                }
                                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition ${
                                    sharedContentTab ===
                                    "links"
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <LinkIcon size={17} />

                                Links

                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                    {sharedLinks.length}
                                </span>
                            </button>

                        </div>

                    </div>

                    {/* Shared Content Body */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">

                        {/* Pictures */}
                        {sharedContentTab ===
                            "pictures" && (
                            <div>

                                {sharedPictures.length ===
                                0 ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                            <ImageIcon
                                                size={26}
                                                className="text-indigo-600"
                                            />
                                        </div>

                                        <h2 className="mt-4 font-semibold text-slate-900">
                                            No pictures yet
                                        </h2>

                                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                                            Pictures shared in this
                                            conversation will appear
                                            here.
                                        </p>

                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

                                        {sharedPictures.flatMap(
                                            (message) =>
                                                message.attachments.map(
                                                    (
                                                        attachment,
                                                        index
                                                    ) => (
                                                        <a
                                                            key={`${message._id}-${index}`}
                                                            href={
                                                                attachment.url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                                                        >
                                                            <img
                                                                src={
                                                                    attachment.url
                                                                }
                                                                alt={
                                                                    attachment.fileName ||
                                                                    "Shared picture"
                                                                }
                                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                            />
                                                        </a>
                                                    )
                                                )
                                        )}

                                    </div>
                                )}

                            </div>
                        )}

                        {/* Documents */}
                        {sharedContentTab ===
                            "docs" && (
                            <div className="space-y-3">

                                {sharedDocuments.length ===
                                0 ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                            <FileText
                                                size={26}
                                                className="text-indigo-600"
                                            />
                                        </div>

                                        <h2 className="mt-4 font-semibold text-slate-900">
                                            No documents yet
                                        </h2>

                                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                                            Documents shared in this
                                            conversation will appear
                                            here.
                                        </p>

                                    </div>
                                ) : (
                                    sharedDocuments.flatMap(
                                        (message) =>
                                            message.attachments.map(
                                                (
                                                    attachment,
                                                    index
                                                ) => (
                                                    <a
                                                        key={`${message._id}-${index}`}
                                                        href={
                                                            attachment.url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                                                    >

                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                                                            <FileText
                                                                size={21}
                                                                className="text-indigo-600"
                                                            />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                                {
                                                                    attachment.fileName
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {
                                                                    attachment.mimeType
                                                                }
                                                            </p>
                                                        </div>

                                                        <span className="text-xs font-medium text-indigo-600">
                                                            Open
                                                        </span>

                                                    </a>
                                                )
                                            )
                                    )
                                )}

                            </div>
                        )}

                        {/* Links */}
                        {sharedContentTab ===
                            "links" && (
                            <div className="space-y-3">

                                {sharedLinks.length ===
                                0 ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                            <LinkIcon
                                                size={26}
                                                className="text-indigo-600"
                                            />
                                        </div>

                                        <h2 className="mt-4 font-semibold text-slate-900">
                                            No links yet
                                        </h2>

                                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                                            Links shared in this
                                            conversation will appear
                                            here.
                                        </p>

                                    </div>
                                ) : (
                                    sharedLinks.map(
                                        (link, index) => (
                                            <a
                                                key={`${link.messageId}-${index}`}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                                            >

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                                                    <LinkIcon
                                                        size={21}
                                                        className="text-indigo-600"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        {link.url}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Shared link
                                                    </p>
                                                </div>

                                                <span className="text-xs font-medium text-indigo-600">
                                                    Open
                                                </span>

                                            </a>
                                        )
                                    )
                                )}

                            </div>
                        )}

                    </div>

                </div>
            ) : (
            <>
                {/* Chat Header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-4">

                    {/* Back to Messages */}
                    <button
                        onClick={() =>
                            navigate("/messages")
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Back to messages"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Clickable profile/header area */}
                    <button
                        type="button"
                        onClick={() =>
                            setShowSharedContent(true)
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left transition hover:bg-slate-50"
                        aria-label={`Open shared content with ${otherParticipant?.name || "user"}`}
                    >
                        {/* Profile picture */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">

                            {otherParticipant?.profilePic?.url ? (
                                <img
                                    src={
                                        otherParticipant
                                            .profilePic.url
                                    }
                                    alt={
                                        otherParticipant.name
                                    }
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                otherParticipant?.name
                                    ?.charAt(0)
                                    .toUpperCase()
                            )}

                        </div>

                        {/* User information */}
                        <div className="min-w-0">
                            <h1 className="truncate font-semibold text-slate-900">
                                {otherParticipant?.name}
                            </h1>

                            <p className="text-xs text-slate-500">
                                {isOtherUserTyping ? (
                                    <span className="text-indigo-600">
                                        typing...
                                    </span>
                                ) : isOtherUserOnline ? (
                                    <span className="text-emerald-600">
                                        ● Online
                                    </span>
                                ) : (
                                    `Last seen ${formatLastSeen(
                                        lastSeenAt
                                    )}`
                                )}
                            </p>
                        </div>
                    </button>
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
                            {messages.map(
                                (message) => {
                                    const isOwnMessage =
                                        String(
                                            message.sender?._id
                                        ) ===
                                        String(
                                            user?._id
                                        );

                                    return (
                                        <div
                                            key={
                                                message._id
                                            }
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
                                                <div className="min-w-0">

                                                    {/* Text */}
                                                    {message.content && (
                                                        <div className="break-words">
                                                            {renderMessageContent(
                                                                message.content
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Attachment */}
                                                    {renderMessageAttachments(message)}

                                                    {/* Time + ticks */}
                                                    <div
                                                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                                            isOwnMessage
                                                                ? "text-indigo-100"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        <span>
                                                            {formatMessageTime(
                                                                message.createdAt
                                                            )}
                                                        </span>

                                                        {isOwnMessage && (
                                                            <span
                                                                className={
                                                                    message.readAt
                                                                        ? "text-sky-400"
                                                                        : ""
                                                                }
                                                            >
                                                                {message.readAt
                                                                    ? "✓✓"
                                                                    : message.deliveredAt
                                                                        ? "✓✓"
                                                                        : "✓"}
                                                            </span>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
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
                    {/* Hidden file inputs */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelected}
                        className="hidden"
                    />

                    <input
                        ref={documentInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        onChange={handleFileSelected}
                        className="hidden"
                    />

                    {/* Selected attachment */}
                    {selectedFile && (
                        <div className="mb-3 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                            {selectedFile.type.startsWith("image/") ? (
                                <Image
                                    size={18}
                                    className="shrink-0 text-indigo-600"
                                />
                            ) : (
                                <FileText
                                    size={18}
                                    className="shrink-0 text-indigo-600"
                                />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">
                                    {selectedFile.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={clearSelectedFile}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                                aria-label="Remove attachment"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3">

                        {/* Attachment menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAttachmentMenu(
                                        (previous) => !previous
                                    )
                                }
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                                    showAttachmentMenu
                                        ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                }`}
                                aria-label="Attach file"
                                aria-expanded={showAttachmentMenu}
                            >
                                <Paperclip size={19} />
                            </button>

                            {showAttachmentMenu && (
                                <div className="absolute bottom-11 left-0 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAttachmentMenu(false);
                                            imageInputRef.current?.click();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        <ImageIcon
                                            size={18}
                                            className="text-indigo-600"
                                        />

                                        <div className="text-left">
                                            <p className="font-medium">
                                                Photos
                                            </p>

                                            <p className="text-[11px] text-slate-400">
                                                JPG, PNG, WebP
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAttachmentMenu(false);
                                            documentInputRef.current?.click();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        <FileText
                                            size={18}
                                            className="text-indigo-600"
                                        />

                                        <div className="text-left">
                                            <p className="font-medium">
                                                Documents
                                            </p>

                                            <p className="text-[11px] text-slate-400">
                                                PDF, DOC, XLS, PPT
                                            </p>
                                        </div>
                                    </button>

                                </div>
                            )}
                        </div>

                        {/* Message input */}
                        <input
                            type="text"
                            value={content}
                            onChange={(event) => {
                                const value = event.target.value;

                                setContent(value);

                                if (value.trim()) {
                                    emitTypingStart();
                                } else {
                                    emitTypingStop();
                                }
                            }}
                            placeholder={
                                selectedFile
                                    ? "Add a message (optional)..."
                                    : "Type a message..."
                            }
                            disabled={uploadingAttachment}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                        />

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={
                                sending ||
                                uploadingAttachment ||
                                (!content.trim() && !selectedFile)
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={
                                uploadingAttachment
                                    ? "Uploading attachment"
                                    : "Send message"
                            }
                        >
                            {uploadingAttachment ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>

                    </div>
                </form>
            </>
            )}
        </div>
    );
};

export default Chat;