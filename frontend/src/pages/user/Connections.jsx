import { useEffect, useState } from "react";
import {
    Users,
    UserRound,
    Clock3,
    RefreshCw,
    UserMinus,
    Compass,
    X,
} from "lucide-react";

import {
    getMyConnections,
    removeConnection,
} from "../../services/connection.service";

const Connections = () => {
    const [connections, setConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [notice, setNotice] = useState("");

    const fetchConnections = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await getMyConnections();

            setConnections(
                response.data?.connections || []
            );
        } catch (error) {
            console.error(
                "Failed to fetch connections:",
                error
            );

            setError(
                error.message ||
                    "Failed to load your connections."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => {
            setNotice("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [notice]);

    const handleRemoveConnection = async (
        connectionId,
        userName
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove ${userName || "this user"} from your connections?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(connectionId);
            await removeConnection(connectionId);
            setConnections((current) =>
                current.filter(
                    (connection) =>
                        connection.connectionId !==
                        connectionId
                )
            );

            setNotice(
                `${userName || "User"} was removed from your connections.`
            );
        } catch (error) {
            console.error(
                "Failed to remove connection:",
                error
            );

            setNotice(
                error.message ||
                    "Failed to remove connection."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const formatConnectedDate = (date) => {
        if (!date) return "";
        const connectedDate = new Date(date);
        const now = new Date();
        const difference =
            now.getTime() -
            connectedDate.getTime();

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

        return connectedDate.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    const getInitial = (name) => {
        return (
            name?.charAt(0)?.toUpperCase() || "U"
        );
    };

    const renderAvatar = (user) => {
        if (user?.profilePic?.url) {
            return (
                <img
                    src={user.profilePic.url}
                    alt={user.name || "User"}
                    className="h-16 w-16 rounded-2xl object-cover"
                />
            );
        }

        return (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                {getInitial(user?.name)}
            </div>
        );
    };

    const renderInterests = (interests = []) => {
        if (!interests.length) {
            return null;
        }

        const visibleInterests =
            interests.slice(0, 3);
        const remaining =
            interests.length -
            visibleInterests.length;

        return (
            <div className="mt-4 flex flex-wrap gap-2">
                {visibleInterests.map(
                    (interest) => (
                        <span
                            key={interest}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                            {interest}
                        </span>
                    )
                )}

                {remaining > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        +{remaining} more
                    </span>
                )}
            </div>
        );
    };

    const renderConnectionCard = (
        connection
    ) => {
        const user = connection.user;
        const isActionLoading =
            actionLoading ===
            connection.connectionId;

        return (
            <article
                key={connection.connectionId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
                <div className="flex flex-col gap-5">
                    {/* User information */}
                    <div className="flex min-w-0 gap-4">
                        {renderAvatar(user)}

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-bold text-slate-900">
                                    {user?.name ||
                                        "Nexora user"}
                                </h3>

                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Connected
                                </span>
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                <Clock3 size={13} />
                                Connected{" "}
                                {formatConnectedDate(
                                    connection.connectedAt
                                )}
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
                    <div className="flex gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            <UserRound size={16} />
                            View Profile
                        </button>

                        <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() =>
                                handleRemoveConnection(
                                    connection.connectionId,
                                    user?.name
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <UserMinus size={16} />

                            <span className="hidden sm:inline">
                                {isActionLoading
                                    ? "Removing..."
                                    : "Remove"}
                            </span>
                        </button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-7">
            {/* Header */}
            <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            Your Network
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                My Connections
                            </h1>

                            {!isLoading && (
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                    {connections.length}{" "}
                                    {connections.length ===
                                    1
                                        ? "connection"
                                        : "connections"}
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            People you've connected with
                            on Nexora.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchConnections}
                        disabled={isLoading}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <Users size={17} />
                    {notice}
                </div>
            )}

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
                        onClick={fetchConnections}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <section className="grid gap-5 md:grid-cols-2">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 w-40 rounded bg-slate-200" />
                                        <div className="h-4 w-28 rounded bg-slate-200" />
                                        <div className="h-4 w-full rounded bg-slate-200" />
                                    </div>
                                </div>
                                <div className="mt-5 h-10 rounded-xl bg-slate-200" />
                            </div>
                        )
                    )}
                </section>
            )}

            {/* Connections */}
            {!isLoading &&
                !error &&
                connections.length > 0 && (
                    <section className="grid gap-5 md:grid-cols-2">
                        {connections.map(
                            renderConnectionCard
                        )}
                    </section>
                )}

            {/* Empty state */}
            {!isLoading &&
                !error &&
                connections.length === 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Users
                                size={26}
                                className="text-slate-500"
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                            Your network is empty
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Start discovering people
                            nearby and build meaningful
                            connections on Nexora.
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
                    </section>
                )}
        </div>
    );
};

export default Connections;