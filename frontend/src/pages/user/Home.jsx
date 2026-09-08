import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Loader2,
    MapPin,
    Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    discoverUsers,
    updateUserLocation,
} from "../../services/user.service";
import {
    sendConnectionRequest,
    getMyConnections,
    getReceivedConnectionRequests,
    getSentConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest
} from "../../services/connection.service";

const Home = () => {
    const { user } = useAuth();

    const [discoveredUsers, setDiscoveredUsers] = useState([]);
    const [discoveryType, setDiscoveryType] = useState("nearby");
    const [radius, setRadius] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [locationRequired, setLocationRequired] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [error, setError] = useState("");
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [connectingUserId, setConnectingUserId] = useState(null);

    const fetchDiscoveredUsers = async (
        type = discoveryType,
        selectedRadius = radius
    ) => {
        try {
            setIsLoading(true);
            setError("");
            setLocationRequired(false);

            const response = await discoverUsers(
                type,
                10,
                selectedRadius
            );

            setDiscoveredUsers(
                response.data.users || []
            );
        } catch (error) {
            console.error(
                "Failed to discover users:",
                error
            );

            if (
                error.message ===
                "Please update your location before discovering users."
            ) {
                setLocationRequired(true);
                setDiscoveredUsers([]);
            } else {
                setError(
                    error.message ||
                    "Failed to discover users."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConnectionStatuses = async () => {
        try {
            const [
                connectionsResponse,
                receivedResponse,
                sentResponse,
            ] = await Promise.all([
                getMyConnections(),
                getReceivedConnectionRequests(),
                getSentConnectionRequests(),
            ]);

            const statuses = {};

            const connections =
                connectionsResponse.data.connections || [];

            connections.forEach((connection) => {
                statuses[connection.user._id] = {
                    status: "connected",
                    connectionId: connection.connectionId,
                };
            });

            const receivedRequests =
                receivedResponse.data.requests || [];

            receivedRequests.forEach((request) => {
                statuses[request.requester._id] = {
                    status: "received",
                    connectionId: request._id,
                };
            });

            const sentRequests =
                sentResponse.data.requests || [];

            sentRequests.forEach((request) => {
                statuses[request.recipient._id] = {
                    status: "pending",
                    connectionId: request._id,
                };
            });

            setConnectionStatuses(statuses);
        } catch (error) {
            console.error(
                "Failed to fetch connection statuses:",
                error
            );
        }
    };

    const handleConnect = async (userId) => {
        try {
            setConnectingUserId(userId);

            const response =
                await sendConnectionRequest(userId);

            const connection =
                response.data.connection;

            if (
                response.message ===
                "Connection request accepted automatically"
            ) {
                setConnectionStatuses((previous) => ({
                    ...previous,
                    [userId]: {
                        status: "connected",
                        connectionId: connection._id,
                    },
                }));
            } else {
                setConnectionStatuses((previous) => ({
                    ...previous,
                    [userId]: {
                        status: "pending",
                        connectionId: connection._id,
                    },
                }));
            }
        } catch (error) {
            console.error(
                "Failed to send connection request:",
                error
            );

            setError(
                error.message ||
                "Failed to send connection request."
            );
        } finally {
            setConnectingUserId(null);
        }
    };

    const handleAccept = async (
        userId,
        connectionId
    ) => {
        try {
            setConnectingUserId(userId);

            await acceptConnectionRequest(
                connectionId
            );

            setConnectionStatuses((previous) => ({
                ...previous,
                [userId]: {
                    status: "connected",
                    connectionId,
                },
            }));
        } catch (error) {
            console.error(
                "Failed to accept connection:",
                error
            );

            setError(
                error.message ||
                "Failed to accept connection."
            );
        } finally {
            setConnectingUserId(null);
        }
    };

    const handleReject = async (
        userId,
        connectionId
    ) => {
        try {
            setConnectingUserId(userId);

            await rejectConnectionRequest(
                connectionId
            );

            setConnectionStatuses((previous) => {
                const updated = {
                    ...previous,
                };

                delete updated[userId];

                return updated;
            });
        } catch (error) {
            console.error(
                "Failed to reject connection:",
                error
            );

            setError(
                error.message ||
                "Failed to reject connection."
            );
        } finally {
            setConnectingUserId(null);
        }
    };

    useEffect(() => {
        fetchDiscoveredUsers();
        fetchConnectionStatuses();
    }, []);

    const handleEnableLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                "Location services are not supported by your browser."
            );
            return;
        }

        setIsUpdatingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } =
                        position.coords;

                    await updateUserLocation(
                        longitude,
                        latitude
                    );

                    await fetchDiscoveredUsers();
                } catch (error) {
                    console.error(
                        "Failed to update location:",
                        error
                    );

                    setLocationError(
                        error.message ||
                        "Failed to update your location."
                    );
                } finally {
                    setIsUpdatingLocation(false);
                }
            },
            (error) => {
                console.error(
                    "Geolocation error:",
                    error
                );

                let message =
                    "Unable to access your location.";

                if (error.code === 1) {
                    message =
                        "Location permission was denied. Please allow location access in your browser settings.";
                } else if (error.code === 2) {
                    message =
                        "Your location could not be determined. Please try again.";
                } else if (error.code === 3) {
                    message =
                        "Location request timed out. Please try again.";
                }

                setLocationError(message);
                setIsUpdatingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            {/* Welcome Section */}
            <section>
                <p className="text-sm font-medium text-indigo-600">
                    Welcome back
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Hello, {user?.name || "User"} 👋
                </h1>

                <p className="mt-2 text-slate-500">
                    Discover people around you and build meaningful
                    connections.
                </p>
            </section>

            {/* Discovery Overview */}
            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Users size={21} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                People discovered
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {isLoading
                                    ? "—"
                                    : discoveredUsers.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                            <MapPin size={21} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Discovery
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {locationRequired
                                    ? "Location required"
                                    : "People around you"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Discovery */}
            <section>
                <div className="mb-5">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600">
                            Discovery
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                            Find your people
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Discover people based on your interests,
                            goals, and location.
                        </p>
                    </div>
                </div>

                {/* Discovery Controls */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                {
                                    value: "nearby",
                                    label: "Nearby",
                                    icon: MapPin,
                                },
                                {
                                    value: "friends",
                                    label: "Friends",
                                    icon: Users,
                                },
                                {
                                    value: "professional",
                                    label: "Professional",
                                    icon: CheckCircle2,
                                },
                                {
                                    value: "learning",
                                    label: "Learning",
                                    icon: CheckCircle2,
                                },
                                {
                                    value: "interests",
                                    label: "Interests",
                                    icon: CheckCircle2,
                                },
                            ].map((category) => {
                                const Icon = category.icon;
                                const isActive =
                                    discoveryType === category.value;

                                return (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => {
                                            setDiscoveryType(
                                                category.value
                                            );

                                            fetchDiscoveredUsers(
                                                category.value,
                                                radius
                                            );
                                        }}
                                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {category.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Radius */}
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="discovery-radius"
                                className="text-sm font-medium text-slate-500"
                            >
                                Radius
                            </label>

                            <select
                                id="discovery-radius"
                                value={radius}
                                onChange={(event) => {
                                    const newRadius = Number(
                                        event.target.value
                                    );

                                    setRadius(newRadius);

                                    fetchDiscoveredUsers(
                                        discoveryType,
                                        newRadius
                                    );
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value={10}>10 km</option>
                                <option value={25}>25 km</option>
                                <option value={50}>50 km</option>
                                <option value={100}>100 km</option>
                                <option value={250}>250 km</option>
                                <option value={500}>500 km</option>
                                <option value={1000}>1000 km</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <Loader2
                            size={22}
                            className="mx-auto animate-spin text-indigo-600"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            Discovering people...
                        </p>
                    </div>
                )}

                {/* Location Required */}
                {!isLoading && locationRequired && (
                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <MapPin size={25} />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    Enable location to discover people
                                </h3>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                    Nexora uses your location to find
                                    relevant people around you. Your exact
                                    location is kept protected and is not
                                    shown to other users.
                                </p>

                                {locationError && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {locationError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={handleEnableLocation}
                                    disabled={isUpdatingLocation}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isUpdatingLocation ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Updating location...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin size={17} />
                                            Enable Location
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generic Error */}
                {!isLoading &&
                    !locationRequired &&
                    error && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                {/* Empty */}
                {!isLoading &&
                    !locationRequired &&
                    !error &&
                    discoveredUsers.length === 0 && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <Users
                                    size={20}
                                    className="text-slate-500"
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No people found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try another discovery category or increase
                                your search radius.
                            </p>
                        </div>
                    )}

                {/* Discovered Users */}
                {!isLoading &&
                    !locationRequired &&
                    !error &&
                    discoveredUsers.length > 0 && (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {discoveredUsers.map((discoveredUser) => {
                                const initial =
                                    discoveredUser.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U";

                                const connectionStatus =
                                    connectionStatuses[
                                        discoveredUser._id
                                    ]?.status;

                                const isConnecting =
                                    connectingUserId ===
                                    discoveredUser._id;

                                return (
                                    <div
                                        key={discoveredUser._id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                                                {initial}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-slate-900">
                                                    {discoveredUser.name}
                                                </h3>

                                                <p className="mt-1 text-sm capitalize text-slate-500">
                                                    {discoveredUser.gender ||
                                                        "Nexora user"}
                                                </p>
                                            </div>
                                        </div>

                                        {discoveredUser.bio && (
                                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                                                {discoveredUser.bio}
                                            </p>
                                        )}

                                        {discoveredUser.interests?.length >
                                            0 && (
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {discoveredUser.interests
                                                    .slice(0, 3)
                                                    .map((interest) => (
                                                        <span
                                                            key={interest}
                                                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Connection Actions */}
                                        {connectionStatus ===
                                        "received" ? (
                                            <div className="mt-5 flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isConnecting}
                                                    onClick={() =>
                                                        handleAccept(
                                                            discoveredUser._id,
                                                            connectionStatuses[
                                                                discoveredUser._id
                                                            ].connectionId
                                                        )
                                                    }
                                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isConnecting
                                                        ? "Processing..."
                                                        : "Accept"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={isConnecting}
                                                    onClick={() =>
                                                        handleReject(
                                                            discoveredUser._id,
                                                            connectionStatuses[
                                                                discoveredUser._id
                                                            ].connectionId
                                                        )
                                                    }
                                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={
                                                    connectionStatus ===
                                                        "pending" ||
                                                    connectionStatus ===
                                                        "connected" ||
                                                    isConnecting
                                                }
                                                onClick={() =>
                                                    handleConnect(
                                                        discoveredUser._id
                                                    )
                                                }
                                                className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                                    connectionStatus ===
                                                    "connected"
                                                        ? "cursor-default bg-emerald-50 text-emerald-700"
                                                        : connectionStatus ===
                                                        "pending"
                                                        ? "cursor-default bg-slate-100 text-slate-600"
                                                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                                                }`}
                                            >
                                                {isConnecting
                                                    ? "Connecting..."
                                                    : connectionStatus ===
                                                    "connected"
                                                    ? "Connected"
                                                    : connectionStatus ===
                                                    "pending"
                                                    ? "Pending"
                                                    : "Connect"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </section>
        </div>
    );
};

export default Home;