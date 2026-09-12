import { useEffect, useState } from "react";
import {
    Inbox,
    Send,
    UserRound,
    Check,
    X,
    Clock3,
    RefreshCw,
    Compass,
} from "lucide-react";

import {
    getReceivedConnectionRequests,
    getSentConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
} from "../../services/connection.service";

const Requests = () => {
    const [activeTab, setActiveTab] = useState("received");

    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(null);
    const [notice, setNotice] = useState("");

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            setError("");

            const [receivedResponse, sentResponse] =
                await Promise.all([
                    getReceivedConnectionRequests(),
                    getSentConnectionRequests(),
                ]);

            setReceivedRequests(
                receivedResponse.data?.requests || []
            );

            setSentRequests(
                sentResponse.data?.requests || []
            );
        } catch (error) {
            console.error(
                "Failed to fetch connection requests:",
                error
            );

            setError(
                error.message ||
                    "Failed to load connection requests."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (!notice) {
            return;
        }

        const timer = setTimeout(() => {
            setNotice("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [notice]);

    const handleAccept = async (connectionId) => {
        try {
            setActionLoading(connectionId);

            await acceptConnectionRequest(connectionId);

            setReceivedRequests((current) =>
                current.filter(
                    (request) =>
                        request._id !== connectionId
                )
            );

            setNotice("You're now connected.");
        } catch (error) {
            setNotice(
                error.message ||
                    "Failed to accept the request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (connectionId) => {
        try {
            setActionLoading(connectionId);

            await rejectConnectionRequest(connectionId);

            setReceivedRequests((current) =>
                current.filter(
                    (request) =>
                        request._id !== connectionId
                )
            );

            setNotice("Request declined.");
        } catch (error) {
            setNotice(
                error.message ||
                    "Failed to decline the request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (connectionId) => {
        try {
            setActionLoading(connectionId);

            await cancelConnectionRequest(connectionId);

            setSentRequests((current) =>
                current.filter(
                    (request) =>
                        request._id !== connectionId
                )
            );

            setNotice("Connection request cancelled.");
        } catch (error) {
            setNotice(
                error.message ||
                    "Failed to cancel the request."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const currentRequests =
        activeTab === "received"
            ? receivedRequests
            : sentRequests;

    const pendingCount = receivedRequests.length;

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        const requestDate = new Date(date);
        const now = new Date();

        const difference =
            now.getTime() - requestDate.getTime();

        const minutes = Math.floor(
            difference / (1000 * 60)
        );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.floor(hours / 24);

        if (days < 7) {
            return `${days}d ago`;
        }

        return requestDate.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
            }
        );
    };

    const getUserFromRequest = (request) => {
        return activeTab === "received"
            ? request.requester
            : request.recipient;
    };

    const getInitial = (name) => {
        return (
            name?.charAt(0)?.toUpperCase() || "U"
        );
    };

    const renderAvatar = (user) => {
        const imageUrl = user?.profilePic?.url;

        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt={user?.name || "User"}
                    className="h-16 w-16 rounded-2xl object-cover"
                />
            );
        }

        return (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                {getInitial(user?.name)}
            </div>
        );
    };

    const renderInterests = (interests = []) => {
        if (!interests.length) {
            return null;
        }

        const visibleInterests = interests.slice(0, 3);
        const remainingCount =
            interests.length - visibleInterests.length;

        return (
            <div className="mt-4 flex flex-wrap gap-2">
                {visibleInterests.map((interest) => (
                    <span
                        key={interest}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                        {interest}
                    </span>
                ))}

                {remainingCount > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        +{remainingCount} more
                    </span>
                )}
            </div>
        );
    };

    const renderRequestCard = (request) => {
        const user = getUserFromRequest(request);

        const isActionLoading =
            actionLoading === request._id;

        return (
            <article
                key={request._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    {/* Profile */}
                    <div className="flex min-w-0 flex-1 gap-4">
                        {renderAvatar(user)}

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-bold text-slate-900">
                                    {user?.name || "Nexora user"}
                                </h3>

                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    <Clock3 size={12} />
                                    {formatTime(
                                        request.createdAt
                                    )}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {activeTab === "received"
                                    ? "Wants to connect with you"
                                    : "Connection request sent"}
                            </p>

                            {user?.bio && (
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {user.bio}
                                </p>
                            )}

                            {renderInterests(
                                user?.interests
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2 sm:pt-1">
                        {activeTab === "received" ? (
                            <>
                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                        handleAccept(
                                            request._id
                                        )
                                    }
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                                >
                                    <Check size={16} />

                                    {isActionLoading
                                        ? "..."
                                        : "Accept"}
                                </button>

                                <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() =>
                                        handleReject(
                                            request._id
                                        )
                                    }
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                                >
                                    <X size={16} />
                                    Decline
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() =>
                                    handleCancel(
                                        request._id
                                    )
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                <X size={16} />

                                {isActionLoading
                                    ? "Cancelling..."
                                    : "Cancel Request"}
                            </button>
                        )}
                    </div>
                </div>
            </article>
        );
    };

    const renderEmptyState = () => {
        const isReceived = activeTab === "received";

        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    {isReceived ? (
                        <Inbox
                            size={24}
                            className="text-slate-500"
                        />
                    ) : (
                        <Send
                            size={24}
                            className="text-slate-500"
                        />
                    )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {isReceived
                        ? "Your network is quiet"
                        : "No pending requests"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {isReceived
                        ? "When someone nearby wants to connect with you, their request will appear here."
                        : "People you ask to connect with will appear here until they respond."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        (window.location.href =
                            "/discover")
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    <Compass size={17} />
                    Discover People
                </button>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            {/* Header */}
            <section>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            Connections
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Connection Requests
                            </h1>

                            {pendingCount > 0 && (
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                    {pendingCount} pending
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            People who want to connect with you
                            and requests you've sent.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchRequests}
                        disabled={isLoading}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>
                </div>
            </section>

            {/* Notice */}
            {notice && (
                <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                    <Check size={17} />
                    {notice}
                </div>
            )}

            {/* Tabs */}
            <section className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <div className="grid grid-cols-2 gap-1">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("received")
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            activeTab === "received"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <Inbox size={17} />
                        Received

                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                activeTab === "received"
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {receivedRequests.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab("sent")
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            activeTab === "sent"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <Send size={17} />
                        Sent

                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                                activeTab === "sent"
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {sentRequests.length}
                        </span>
                    </button>
                </div>
            </section>

            {/* Error */}
            {!isLoading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                        <X
                            size={20}
                            className="text-red-600"
                        />
                    </div>

                    <h3 className="mt-4 font-semibold text-red-900">
                        Something went wrong
                    </h3>

                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchRequests}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex gap-4">
                                <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200" />

                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-40 rounded bg-slate-200" />
                                    <div className="h-4 w-56 rounded bg-slate-200" />
                                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Requests */}
            {!isLoading &&
                !error &&
                currentRequests.length > 0 && (
                    <section className="space-y-4">
                        {currentRequests.map(
                            renderRequestCard
                        )}
                    </section>
                )}

            {/* Empty */}
            {!isLoading &&
                !error &&
                currentRequests.length === 0 &&
                renderEmptyState()}
        </div>
    );
};

export default Requests;