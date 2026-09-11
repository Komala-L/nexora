import { useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    Heart,
    BriefcaseBusiness,
    GraduationCap,
    Compass,
    Pencil,
    Sparkles,
    ShieldCheck,
    User,
} from "lucide-react";

import { getCurrentUser } from "../../services/user.service";
import EditProfileModal from "./EditProfileModal";

const MyProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setError("");

            const response = await getCurrentUser();

            setUser(response.data?.user || null);
        } catch (error) {
            console.error(
                "Failed to fetch current user:",
                error
            );

            setError(
                error.message ||
                    "Failed to load your profile."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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
                    className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-xl sm:h-32 sm:w-32"
                />
            );
        }

        return (
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-indigo-100 via-violet-100 to-cyan-100 text-4xl font-bold text-indigo-600 shadow-xl sm:h-32 sm:w-32">
                {getInitial(user?.name)}
            </div>
        );
    };

    const renderEmptyState = (
        icon,
        title,
        description
    ) => {
        const Icon = icon;

        return (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon
                        size={18}
                        className="text-slate-400"
                    />
                </div>

                <div>
                    <p className="text-sm font-semibold text-slate-700">
                        {title}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        );
    };

    /* ---------------- LOADING ---------------- */

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-5xl animate-pulse space-y-5">
                <div className="h-8 w-40 rounded-lg bg-slate-200" />

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="h-40 bg-slate-200 sm:h-48" />

                    <div className="px-6 pb-8 sm:px-10">
                        <div className="-mt-16 h-32 w-32 rounded-3xl border-4 border-white bg-slate-300" />

                        <div className="mt-5 space-y-3">
                            <div className="h-8 w-52 rounded-lg bg-slate-200" />
                            <div className="h-4 w-64 rounded-lg bg-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="h-44 rounded-3xl bg-slate-200" />
                    <div className="h-44 rounded-3xl bg-slate-200" />
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
                        <UserRound
                            size={28}
                            className="text-red-500"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        Profile unavailable
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error ||
                            "We couldn't load your profile."}
                    </p>

                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="mt-7 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5">
            {/* PAGE HEADER */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Your space
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        My Profile
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage how you appear across Nexora.
                    </p>
                </div>
            </div>

            {/* HERO */}

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* Cover */}

                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-200 via-violet-100 to-cyan-200 sm:h-48">
                    <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl" />

                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />

                    <div className="absolute bottom-[-70px] left-1/3 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

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

                {/* Identity */}

                <div className="px-6 pb-7 sm:px-10">
                    <div className="relative z-10 -mt-16">
                        {renderAvatar()}
                    </div>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    {user.name}
                                </h2>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active member
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                {user.gender && (
                                    <>
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                                            <User
                                                size={14}
                                            />
                                            {user.gender}
                                        </span>

                                        <span className="text-slate-300">
                                            •
                                        </span>
                                    </>
                                )}

                                <span className="inline-flex items-center gap-1.5">
                                    <Mail size={14} />
                                    {user.email}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsEditProfileOpen(true)}
                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>
                    </div>
                </div>
            </section>

            {/* ABOUT + INTERESTS */}

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
                                About you
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        {user.bio ? (
                            <p className="text-sm leading-7 text-slate-600 sm:text-base">
                                {user.bio}
                            </p>
                        ) : (
                            renderEmptyState(
                                UserRound,
                                "No bio added yet",
                                "Tell people a little about yourself."
                            )
                        )}
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
                                Things you enjoy
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        {user.interests?.length ? (
                            <div className="flex flex-wrap gap-2.5">
                                {user.interests.map(
                                    (interest) => (
                                        <span
                                            key={interest}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700"
                                        >
                                            <Sparkles
                                                size={13}
                                            />
                                            {interest}
                                        </span>
                                    )
                                )}
                            </div>
                        ) : (
                            renderEmptyState(
                                Heart,
                                "No interests added yet",
                                "Add interests to help people discover you."
                            )
                        )}
                    </div>
                </section>
            </div>

            {/* PROFESSIONAL + LEARNING */}

            <div className="grid gap-5 md:grid-cols-2">
                {/* PROFESSIONAL */}

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
                            <BriefcaseBusiness
                                size={19}
                                className="text-cyan-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                                Professional
                            </p>

                            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                                Your professional space
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        {user.professional &&
                        (
                            user.professional.role ||
                            user.professional.company ||
                            user.professional.skills?.length ||
                            user.professional.industry
                        ) ? (
                            <div className="space-y-3 text-sm">
                                {user.professional.role && (
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Role:
                                        </span>{" "}
                                        <span className="text-slate-500">
                                            {user.professional.role}
                                        </span>
                                    </p>
                                )}

                                {user.professional.company && (
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Company:
                                        </span>{" "}
                                        <span className="text-slate-500">
                                            {user.professional.company}
                                        </span>
                                    </p>
                                )}

                                {user.professional.industry && (
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Industry:
                                        </span>{" "}
                                        <span className="text-slate-500">
                                            {user.professional.industry}
                                        </span>
                                    </p>
                                )}

                                {user.professional.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {user.professional.skills.map(
                                            (skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            renderEmptyState(
                                BriefcaseBusiness,
                                "Professional details not added",
                                "Add your role, skills and industry."
                            )
                        )}
                    </div>
                </section>

                {/* LEARNING */}

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                            <GraduationCap
                                size={20}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                Learning
                            </p>

                            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                                Your learning journey
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6">
                        {user.learning &&
                        (
                            user.learning.learningGoal ||
                            user.learning.subjects?.length
                        ) ? (
                            <div className="space-y-3 text-sm">
                                {user.learning.learningGoal && (
                                    <p>
                                        <span className="font-semibold text-slate-700">
                                            Goal:
                                        </span>{" "}
                                        <span className="text-slate-500">
                                            {user.learning.learningGoal}
                                        </span>
                                    </p>
                                )}

                                {user.learning.subjects?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {user.learning.subjects.map(
                                            (subject) => (
                                                <span
                                                    key={subject}
                                                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                                                >
                                                    {subject}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            renderEmptyState(
                                GraduationCap,
                                "Learning details not added",
                                "Tell Nexora what you're learning."
                            )
                        )}
                    </div>
                </section>
            </div>

            {/* DISCOVERY PREFERENCES */}

            <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6 shadow-sm sm:p-7">
                <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Compass
                                size={20}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                Discovery
                            </p>

                            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                                What you want to discover
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                        {user.discoveryPreferences?.length ? (
                            user.discoveryPreferences.map(
                                (preference) => (
                                    <span
                                        key={preference}
                                        className="rounded-xl border border-white bg-white px-4 py-2.5 text-sm font-bold capitalize text-indigo-700 shadow-sm"
                                    >
                                        {preference}
                                    </span>
                                )
                            )
                        ) : (
                            <p className="text-sm text-slate-500">
                                No discovery preferences selected yet.
                            </p>
                        )}
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck
                            size={15}
                            className="text-emerald-500"
                        />
                        Your profile information is controlled by you.
                    </div>
                </div>
                {isEditProfileOpen && (
                    <EditProfileModal
                        user={user}
                        onClose={() =>
                            setIsEditProfileOpen(false)
                        }
                        onUpdated={(updatedUser) =>
                            setUser(updatedUser)
                        }
                    />
                )}
            </section>
        </div>
    );
};

export default MyProfile;