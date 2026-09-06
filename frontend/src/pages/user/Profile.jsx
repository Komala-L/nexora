import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Heart,
    RefreshCw,
    AlertCircle,
    Users,
    Sparkles,
    ShieldCheck,
} from "lucide-react";

import { getUserProfile } from "../../services/user.service";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await getUserProfile(userId);

            setUser(response.data?.user || null);
        } catch (error) {
            console.error(
                "Failed to fetch user profile:",
                error
            );

            setError(
                error.message ||
                    "Failed to load this profile."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const getInitial = (name) => {
        return (
            name?.charAt(0)?.toUpperCase() || "U"
        );
    };

    const renderAvatar = () => {
        if (user?.profilePic?.url) {
            return (
                <div className="relative">
                    <img
                        src={user.profilePic.url}
                        alt={user.name || "User"}
                        className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-xl sm:h-32 sm:w-32"
                    />

                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500">
                        <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                </div>
            );
        }

        return (
            <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-indigo-100 via-violet-100 to-cyan-100 text-4xl font-bold text-indigo-600 shadow-xl sm:h-32 sm:w-32">
                    {getInitial(user?.name)}
                </div>

                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-white" />
                </span>
            </div>
        );
    };

    const renderInterests = () => {
        if (!user?.interests?.length) {
            return (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Heart
                            size={18}
                            className="text-slate-400"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            No interests added yet
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            This user hasn't shared their interests.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-wrap gap-2.5">
                {user.interests.map((interest) => (
                    <span
                        key={interest}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-100"
                    >
                        <Sparkles size={13} />
                        {interest}
                    </span>
                ))}
            </div>
        );
    };

    /* ---------------- LOADING ---------------- */

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-5xl animate-pulse">
                <div className="mb-5 h-5 w-36 rounded bg-slate-200" />

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-40 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 sm:h-48" />

                    <div className="px-6 pb-8 sm:px-10">
                        <div className="-mt-16 h-32 w-32 rounded-3xl border-4 border-white bg-slate-200" />

                        <div className="mt-5 space-y-3">
                            <div className="h-8 w-52 rounded bg-slate-200" />
                            <div className="h-5 w-28 rounded bg-slate-200" />
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <div className="h-36 rounded-2xl bg-slate-100" />
                            <div className="h-36 rounded-2xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- ERROR ---------------- */

    if (error || !user) {
        return (
            <div className="mx-auto w-full max-w-2xl">
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                        <AlertCircle
                            size={28}
                            className="text-red-500"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        Profile unavailable
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {error ||
                            "We couldn't find this user."}
                    </p>

                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/connections")
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- PROFILE ---------------- */

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5">
            {/* Back */}
            <button
                type="button"
                onClick={() =>
                    navigate("/connections")
                }
                className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
            >
                <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-1"
                />

                Back to Connections
            </button>

            {/* HERO */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Cover */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-200 via-violet-100 to-cyan-200 sm:h-48">
                    {/* Decorative blobs */}
                    <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl" />

                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />

                    <div className="absolute bottom-[-70px] left-1/3 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

                    {/* Decorative dots */}
                    <div className="absolute right-8 top-8 grid grid-cols-4 gap-2 opacity-30">
                        {[...Array(16)].map(
                            (_, index) => (
                                <span
                                    key={index}
                                    className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                />
                            )
                        )}
                    </div>

                    <div className="absolute left-8 top-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/30 text-indigo-600 backdrop-blur-sm">
                        <Sparkles size={19} />
                    </div>
                </div>

                {/* Profile identity */}
                <div className="px-6 pb-7 sm:px-10">
                    <div className="-mt-16">
                        {renderAvatar()}
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    {user.name}
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Connected
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                {user.gender && (
                                    <>
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                                            <UserRound size={14} />
                                            {user.gender}
                                        </span>

                                        <span className="text-slate-300">
                                            •
                                        </span>
                                    </>
                                )}

                                <span>
                                    Nexora member
                                </span>
                            </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">
                            <ShieldCheck size={17} />
                            Connected safely
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <div className="grid gap-5 md:grid-cols-2">
                {/* ABOUT */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                            <UserRound
                                size={19}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                About
                            </p>

                            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                                Get to know {user.name}
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm leading-7 text-slate-600 sm:text-base">
                            {user.bio ||
                                "This user hasn't added a bio yet."}
                        </p>
                    </div>
                </section>

                {/* INTERESTS */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                            <Heart
                                size={19}
                                className="text-violet-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                                Interests
                            </p>

                            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                                Things they enjoy
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        {renderInterests()}
                    </div>
                </section>
            </div>

            {/* CONNECTION CARD */}
            <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6 shadow-sm sm:p-7">
                <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <Users
                                size={21}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                You're connected
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                You and {user.name} are part
                                of each other's Nexora
                                network.
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        Connected
                    </span>
                </div>
            </section>
        </div>
    );
};

export default Profile;