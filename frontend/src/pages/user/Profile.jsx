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
    Flag,
    X,
    Send,
    CheckCircle2,
} from "lucide-react";

import { getUserProfile, reportUser } from "../../services/user.service";
import {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
} from "../../services/connection.service";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");

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

    const handleConnect = async () => {
        try {
            setIsConnecting(true);

            const response = await sendConnectionRequest(userId);

            const connection = response.data?.connection;

            if (connection?.status === "accepted") {
                setUser((previousUser) => ({
                    ...previousUser,
                    connection: {
                        connectionId: connection._id,
                        status: "connected",
                        direction: null,
                    },
                }));
            } else {
                setUser((previousUser) => ({
                    ...previousUser,
                    connection: {
                        connectionId: connection?._id || null,
                        status: "pending",
                        direction: "sent",
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
            setIsConnecting(false);
        }
    };

    const handleAccept = async () => {
        try {
            setIsConnecting(true);

            const connectionId =
                user.connection?.connectionId;

            await acceptConnectionRequest(connectionId);

            setUser((previousUser) => ({
                ...previousUser,
                connection: {
                    connectionId,
                    status: "connected",
                    direction: null,
                },
            }));
        } catch (error) {
            console.error(
                "Failed to accept connection request:",
                error
            );

            setError(
                error.message ||
                    "Failed to accept connection request."
            );
        } finally {
            setIsConnecting(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsConnecting(true);

            const connectionId =
                user.connection?.connectionId;

            await rejectConnectionRequest(connectionId);

            setUser((previousUser) => ({
                ...previousUser,
                connection: {
                    connectionId: null,
                    status: "none",
                    direction: null,
                },
            }));
        } catch (error) {
            console.error(
                "Failed to reject connection request:",
                error
            );

            setError(
                error.message ||
                    "Failed to reject connection request."
            );
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCancel = async () => {
        try {
            setIsConnecting(true);

            const connectionId =
                user.connection?.connectionId;

            await cancelConnectionRequest(connectionId);

            setUser((previousUser) => ({
                ...previousUser,
                connection: {
                    connectionId: null,
                    status: "none",
                    direction: null,
                },
            }));
        } catch (error) {
            console.error(
                "Failed to cancel connection request:",
                error
            );

            setError(
                error.message ||
                    "Failed to cancel connection request."
            );
        } finally {
            setIsConnecting(false);
        }
    };
    
    const handleReportSubmit = async (event) => {
        event.preventDefault();

        if (!reportReason) {
            setReportError("Please select a reason for reporting.");
            return;
        }

        try {
            setIsSubmittingReport(true);
            setReportError("");

            await reportUser(
                userId,
                reportReason,
                reportDescription.trim()
            );

            setShowReportModal(false);
            setReportReason("");
            setReportDescription("");
            setReportSuccess(
                "Your report has been submitted. Thank you for helping keep Nexora safe."
            );
        } catch (error) {
            setReportError(
                error.message || "Failed to submit your report."
            );
        } finally {
            setIsSubmittingReport(false);
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

                                {user.connection?.status === "connected" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Connected
                                </span>
                            )}

                            {user.connection?.status === "pending" &&
                                user.connection?.direction === "sent" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Request Pending
                                    </span>
                                )}

                            {user.connection?.status === "pending" &&
                                user.connection?.direction === "received" && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                        Wants to Connect
                                    </span>
                                )}
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

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setReportError("");
                                    setShowReportModal(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                                <Flag size={16} />
                                Report User
                            </button>
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
                            {user.connection?.status === "connected" && (
                                <>
                                    <p className="text-sm font-bold text-slate-900">
                                        You're connected
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        You and {user.name} are part
                                        of each other's Nexora
                                        network.
                                    </p>
                                </>
                            )}

                            {user.connection?.status === "none" && (
                                <>
                                    <p className="text-sm font-bold text-slate-900">
                                        Connect with {user.name}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Send a connection request to
                                        grow your Nexora network.
                                    </p>
                                </>
                            )}

                            {user.connection?.status === "pending" &&
                                user.connection?.direction === "sent" && (
                                    <>
                                        <p className="text-sm font-bold text-slate-900">
                                            Connection request sent
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Waiting for {user.name} to
                                            accept your request.
                                        </p>
                                    </>
                                )}

                            {user.connection?.status === "pending" &&
                                user.connection?.direction === "received" && (
                                    <>
                                        <p className="text-sm font-bold text-slate-900">
                                            {user.name} wants to connect
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Accept or reject their
                                            connection request.
                                        </p>
                                    </>
                                )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {user.connection?.status === "none" && (
                            <button
                                type="button"
                                disabled={isConnecting}
                                onClick={handleConnect}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isConnecting
                                    ? "Connecting..."
                                    : "Connect"}
                            </button>
                        )}

                        {user.connection?.status === "pending" &&
                            user.connection?.direction === "sent" && (
                                <button
                                    type="button"
                                    disabled={isConnecting}
                                    onClick={handleCancel}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isConnecting
                                        ? "Cancelling..."
                                        : "Cancel Request"}
                                </button>
                            )}

                        {user.connection?.status === "pending" &&
                            user.connection?.direction === "received" && (
                                <>
                                    <button
                                        type="button"
                                        disabled={isConnecting}
                                        onClick={handleAccept}
                                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isConnecting
                                            ? "Processing..."
                                            : "Accept"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isConnecting}
                                        onClick={handleReject}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                        {user.connection?.status === "connected" && (
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-white" />
                                Connected
                            </span>
                        )}
                    </div>
                </div>
            </section>
            
            {/* REPORT SUCCESS */}
            {reportSuccess && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <p>{reportSuccess}</p>
                    <button
                        type="button"
                        onClick={() => setReportSuccess("")}
                        className="ml-auto rounded-lg p-1 hover:bg-emerald-100"
                        aria-label="Dismiss notification"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* REPORT MODAL */}
            {showReportModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isSubmittingReport
                        ) {
                            setShowReportModal(false);
                            setReportError("");
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-modal-title"
                        className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                    <Flag size={22} />
                                </div>

                                <div>
                                    <h2
                                        id="report-modal-title"
                                        className="text-xl font-bold text-slate-900"
                                    >
                                        Report {user.name}
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Tell us what happened. Our team can review your report.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={isSubmittingReport}
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportError("");
                                }}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                aria-label="Close report dialog"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleReportSubmit}
                            className="mt-7 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="report-reason"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Reason for reporting
                                    <span className="text-rose-500"> *</span>
                                </label>

                                <select
                                    id="report-reason"
                                    required
                                    value={reportReason}
                                    onChange={(event) => {
                                        setReportReason(event.target.value);
                                        setReportError("");
                                    }}
                                    disabled={isSubmittingReport}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="harassment">Harassment or bullying</option>
                                    <option value="spam">Spam</option>
                                    <option value="fake_profile">Fake profile or impersonation</option>
                                    <option value="inappropriate_content">Inappropriate content</option>
                                    <option value="scam">Scam or fraud</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="report-description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Additional details
                                    <span className="ml-1 font-normal text-slate-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    id="report-description"
                                    rows={4}
                                    maxLength={1000}
                                    value={reportDescription}
                                    onChange={(event) =>
                                        setReportDescription(event.target.value)
                                    }
                                    disabled={isSubmittingReport}
                                    placeholder="Share any details that may help us review this report..."
                                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                                />

                                <p className="mt-1.5 text-right text-xs text-slate-400">
                                    {reportDescription.length}/1000 characters
                                </p>
                            </div>

                            {reportError && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                                >
                                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                    <p>{reportError}</p>
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={isSubmittingReport}
                                    onClick={() => {
                                        setShowReportModal(false);
                                        setReportError("");
                                    }}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmittingReport || !reportReason}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmittingReport ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Profile;