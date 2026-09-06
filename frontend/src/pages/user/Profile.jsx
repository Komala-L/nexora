import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Heart,
    RefreshCw,
    AlertCircle,
    Users,
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
                <img
                    src={user.profilePic.url}
                    alt={user.name || "User"}
                    className="h-28 w-28 rounded-3xl object-cover shadow-sm sm:h-32 sm:w-32"
                />
            );
        }

        return (
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-indigo-100 text-4xl font-bold text-indigo-700 shadow-sm sm:h-32 sm:w-32">
                {getInitial(user?.name)}
            </div>
        );
    };

    const renderInterests = () => {
        if (!user?.interests?.length) {
            return (
                <p className="text-sm text-slate-500">
                    No interests added yet.
                </p>
            );
        }

        return (
            <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                    <span
                        key={interest}
                        className="rounded-full bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-700"
                    >
                        {interest}
                    </span>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-4xl">
                <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-32 bg-slate-100 sm:h-40" />

                    <div className="px-6 pb-8 sm:px-10">
                        <div className="-mt-16 h-32 w-32 rounded-3xl bg-slate-200" />

                        <div className="mt-6 space-y-3">
                            <div className="h-7 w-48 rounded bg-slate-200" />
                            <div className="h-4 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
                        </div>

                        <div className="mt-8 h-20 rounded-2xl bg-slate-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="mx-auto w-full max-w-2xl">
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                        <AlertCircle
                            size={27}
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

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={fetchProfile}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/connections")
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-5">
            {/* Back button */}
            <button
                type="button"
                onClick={() =>
                    navigate("/connections")
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft size={17} />
                Back to Connections
            </button>

            {/* Profile card */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-indigo-100 via-violet-100 to-cyan-100 sm:h-40" />

                <div className="px-6 pb-8 sm:px-10">
                    {/* Avatar */}
                    <div className="-mt-16">
                        {renderAvatar()}
                    </div>

                    {/* Basic information */}
                    <div className="mt-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {user.name}
                            </h1>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Connected
                            </span>
                        </div>

                        {user.gender && (
                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                <UserRound size={15} />
                                {user.gender}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mt-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            About
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                            {user.bio ||
                                "This user hasn't added a bio yet."}
                        </p>
                    </div>

                    {/* Interests */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2">
                            <Heart
                                size={17}
                                className="text-indigo-500"
                            />

                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                Interests
                            </h2>
                        </div>

                        <div className="mt-4">
                            {renderInterests()}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 flex items-center gap-3 border-t border-slate-100 pt-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                            <Users
                                size={18}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Nexora Connection
                            </p>

                            <p className="text-xs text-slate-500">
                                You are connected with{" "}
                                {user.name}.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Profile;