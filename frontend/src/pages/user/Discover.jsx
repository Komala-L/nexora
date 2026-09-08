import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    GraduationCap,
    Heart,
    Loader2,
    MapPin,
    Users,
} from "lucide-react";
import { discoverUsers } from "../../services/user.service";

const discoveryOptions = [
    {
        type: "nearby",
        label: "Nearby",
        icon: MapPin,
        description: "People around your current location",
    },
    {
        type: "friends",
        label: "Friends",
        icon: Users,
        description: "People looking to make friends",
    },
    {
        type: "professional",
        label: "Professional",
        icon: Briefcase,
        description: "People interested in professional connections",
    },
    {
        type: "learning",
        label: "Learning",
        icon: GraduationCap,
        description: "People interested in learning and growth",
    },
    {
        type: "interests",
        label: "Interests",
        icon: Heart,
        description: "People who share your interests",
    },
];

const Discover = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState("nearby");
    const [radius, setRadius] = useState(10);

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await discoverUsers(
                selectedType,
                10,
                radius
            );

            setUsers(response.data.users || []);
        } catch (error) {
            console.error(
                "Failed to discover users:",
                error
            );

            setError(
                error.message ||
                "Failed to discover users."
            );

            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedType, radius]);

    return (
        <div className="mx-auto max-w-7xl space-y-8">

            {/* Header */}
            <section>
                <p className="text-sm font-medium text-indigo-600">
                    Discovery
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Find your people
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                    Discover friends, professionals, learners, and
                    people who share your interests.
                </p>
            </section>

            {/* Discovery Categories */}
            <section>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {discoveryOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected =
                            selectedType === option.type;

                        return (
                            <button
                                key={option.type}
                                type="button"
                                onClick={() =>
                                    setSelectedType(
                                        option.type
                                    )
                                }
                                className={`rounded-2xl border p-4 text-left transition ${
                                    isSelected
                                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                        isSelected
                                            ? "bg-white/15"
                                            : "bg-indigo-50 text-indigo-600"
                                    }`}
                                >
                                    <Icon size={20} />
                                </div>

                                <p className="mt-3 font-semibold">
                                    {option.label}
                                </p>

                                <p
                                    className={`mt-1 text-xs leading-5 ${
                                        isSelected
                                            ? "text-indigo-100"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {option.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="font-semibold text-slate-900">
                        {discoveryOptions.find(
                            (option) =>
                                option.type === selectedType
                        )?.label}{" "}
                        discovery
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Search within {radius} km of your
                        discovery location.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <label
                        htmlFor="radius"
                        className="text-sm font-medium text-slate-600"
                    >
                        Radius
                    </label>

                    <select
                        id="radius"
                        value={radius}
                        onChange={(event) =>
                            setRadius(
                                Number(event.target.value)
                            )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={25}>25 km</option>
                        <option value={50}>50 km</option>
                        <option value={100}>100 km</option>
                    </select>
                </div>
            </section>

            {/* Results */}
            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Discover people
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {users.length}{" "}
                        {users.length === 1
                            ? "person"
                            : "people"}{" "}
                        found
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <Loader2
                            size={24}
                            className="mx-auto animate-spin text-indigo-600"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            Discovering people...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!isLoading &&
                    !error &&
                    users.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <Users
                                    size={20}
                                    className="text-slate-500"
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No people found
                            </h3>

                            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                Try increasing your search radius or
                                choosing another discovery category.
                            </p>
                        </div>
                    )}

                {/* Users */}
                {!isLoading &&
                    !error &&
                    users.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {users.map((discoveredUser) => {
                                const initial =
                                    discoveredUser.name
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                    "U";

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
                                                    {
                                                        discoveredUser.name
                                                    }
                                                </h3>

                                                <p className="mt-1 text-sm capitalize text-slate-500">
                                                    {
                                                        discoveredUser.gender
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {discoveredUser.bio && (
                                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                                                {
                                                    discoveredUser.bio
                                                }
                                            </p>
                                        )}

                                        {discoveredUser.interests
                                            ?.length >
                                            0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {discoveredUser.interests
                                                    .slice(0, 4)
                                                    .map(
                                                        (
                                                            interest
                                                        ) => (
                                                            <span
                                                                key={
                                                                    interest
                                                                }
                                                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                                            >
                                                                {
                                                                    interest
                                                                }
                                                            </span>
                                                        )
                                                    )}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/users/${discoveredUser._id}`)}
                                            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                        >
                                            View Profile
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

export default Discover;