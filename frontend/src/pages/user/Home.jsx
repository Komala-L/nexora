import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Loader2,
    MapPin,
    Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
    getNearbyUsers,
    updateUserLocation,
} from "../../services/user.service";

const Home = () => {
    const { user } = useAuth();

    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [locationRequired, setLocationRequired] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [error, setError] = useState("");

    const fetchNearbyUsers = async () => {
        try {
            setIsLoading(true);
            setError("");
            setLocationRequired(false);

            const response = await getNearbyUsers(10);

            setNearbyUsers(response.data.users || []);
        } catch (error) {
            console.error(
                "Failed to fetch nearby users:",
                error
            );

            if (
                error.message ===
                "Please update your location before searching for nearby users."
            ) {
                setLocationRequired(true);
                setNearbyUsers([]);
            } else {
                setError(
                    error.message ||
                    "Failed to load nearby users."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNearbyUsers();
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

                    await fetchNearbyUsers();
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
                                Nearby people
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {isLoading
                                    ? "—"
                                    : nearbyUsers.length}
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

            {/* Nearby Users */}
            <section>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            People near you
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Discover people who are nearby.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                        View all
                    </button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <Loader2
                            size={22}
                            className="mx-auto animate-spin text-indigo-600"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            Finding people near you...
                        </p>
                    </div>
                )}

                {/* Location Required */}
                {!isLoading && locationRequired && (
                    <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <MapPin size={25} />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    Enable location to discover people nearby
                                </h3>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                    Nexora uses your location to find
                                    people around you. Your exact
                                    location is kept protected and is
                                    not shown to other users.
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
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                {/* No Users */}
                {!isLoading &&
                    !locationRequired &&
                    !error &&
                    nearbyUsers.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <CheckCircle2
                                    size={20}
                                    className="text-slate-500"
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No one nearby yet
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                There are currently no discoverable
                                people within your area.
                            </p>
                        </div>
                    )}

                {/* Nearby Users */}
                {!isLoading &&
                    !locationRequired &&
                    !error &&
                    nearbyUsers.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {nearbyUsers.map((nearbyUser) => {
                                const initial =
                                    nearbyUser.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U";

                                return (
                                    <div
                                        key={nearbyUser.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                                                {initial}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-slate-900">
                                                    {nearbyUser.name}
                                                </h3>

                                                <p className="mt-1 text-sm capitalize text-slate-500">
                                                    {nearbyUser.gender ||
                                                        "Nexora user"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                        >
                                            Connect
                                        </button>
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