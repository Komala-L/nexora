import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getAdminDashboardStats, getAdminPlatformActivity, } from "../../services/adminUser.service";
import { getAdminSettings } from "../../services/adminSettings.service";

const navigation = [
    { label: "Overview", icon: "◫", path: "/admin" },
    { label: "Users", icon: "♙", path: "/admin/users" },
    { label: "Reports", icon: "⚑", active: false, path: "/admin/reports" },
    { label: "Settings", icon: "⚙", path: "/admin/settings" },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, logoutAdmin } = useAdminAuth();

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");
    
    const [platformSettings, setPlatformSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [settingsError, setSettingsError] = useState("");
    
    const [activity, setActivity] = useState(null);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState("");
    const [activityDays, setActivityDays] = useState(7);

    useEffect(() => {
        let cancelled = false;
        let requestInProgress = false;

        const loadDashboardData = async () => {
            if (requestInProgress) return;
            requestInProgress = true;

            try {
                const [statsResult, settingsResult] = await Promise.allSettled([
                    getAdminDashboardStats(),
                    getAdminSettings(),
                ]);

                if (cancelled) return;

                let statsSucceeded = false;
                let settingsSucceeded = false;

                if (statsResult.status === "fulfilled") {
                    setStats(statsResult.value?.data?.stats ?? null);
                    setStatsError("");
                    statsSucceeded = true;
                } else {
                    setStatsError(
                        statsResult.reason?.message ||
                            "Unable to load dashboard statistics."
                    );
                }

                if (settingsResult.status === "fulfilled") {
                    setPlatformSettings(
                        settingsResult.value?.data?.settings ?? null
                    );
                    setSettingsError("");
                    settingsSucceeded = true;
                } else {
                    setSettingsError(
                        settingsResult.reason?.message ||
                            "Unable to load platform settings."
                    );
                }

                if (statsSucceeded && settingsSucceeded) {
                    setLastUpdatedAt(new Date());
                }
            } finally {
                if (!cancelled) {
                    setStatsLoading(false);
                    setSettingsLoading(false);
                }

                requestInProgress = false;
            }
        };

        loadDashboardData();

        const intervalId = setInterval(loadDashboardData, 30_000);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        let requestInProgress = false;

        const loadActivity = async () => {
            if (requestInProgress) return;

            requestInProgress = true;

            try {
                const result = await getAdminPlatformActivity({
                    days: activityDays,
                });

                if (cancelled) return;

                setActivity(result?.data?.activity ?? null);
                setActivityError("");
            } catch (error) {
                if (cancelled) return;

                setActivityError(
                    error?.message || "Unable to load platform activity."
                );
            } finally {
                if (!cancelled) {
                    setActivityLoading(false);
                }

                requestInProgress = false;
            }
        };

        setActivityLoading(true);
        loadActivity();

        const intervalId = setInterval(loadActivity, 30_000);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [activityDays]);

    const handleLogout = async () => {
        try {
            await logoutAdmin();
        } finally {
            navigate("/admin/login", { replace: true });
        }
    };

    const statCards = [
        {
            title: "Total users",
            value: stats?.totalUsers,
            description: "Registered Nexora accounts",
            icon: "♙",
        },
        {
            title: "Completed profiles",
            value: stats?.completedProfiles,
            description: "Users who completed their profiles",
            icon: "✓",
        },
        {
            title: "Discoverable users",
            value: stats?.discoverableUsers,
            description: "Users enabled for discovery",
            icon: "↗",
        },
        {
            title: "New registrations",
            value: stats?.newRegistrations,
            description: "Registrations in the last 7 days",
            icon: "+",
        },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
                <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        N
                    </div>
                    <div>
                        <p className="text-lg font-extrabold tracking-[0.16em]">
                            NEXORA
                        </p>
                        <p className="text-xs text-slate-400">ADMIN CONSOLE</p>
                    </div>
                </div>

                <div className="px-4 pt-7">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = item.path === location.pathname;

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    disabled={!item.path}
                                    onClick={() => {
                                        if (item.path) navigate(item.path);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : item.path
                                                ? "text-slate-600 hover:bg-slate-100"
                                                : "cursor-not-allowed text-slate-400"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                    {!item.path && (
                                        <span className="ml-auto text-[10px] text-slate-400">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-slate-100 p-4">
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                            {(admin?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {admin?.name || "Administrator"}
                            </p>
                            <p className="truncate text-xs capitalize text-slate-500">
                                {admin?.role || "admin"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                        ↪ Sign out
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1">
                <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 sm:px-8">
                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Nexora / Administration
                        </p>
                        <h1 className="mt-1 text-lg font-bold">Overview</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">
                                {admin?.name || "Administrator"}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                                {admin?.role || "admin"}
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                            {(admin?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 md:hidden"
                        >
                            Exit
                        </button>
                    </div>
                </header>

                <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-indigo-600">
                            ADMINISTRATION
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">
                            Welcome back{admin?.name ? `, ${admin.name}` : ""}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Monitor your platform and manage the Nexora community.
                        </p>
                    </div>

                    {statsError && (
                        <p
                            role="alert"
                            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {statsError}
                        </p>
                    )}

                    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((stat) => (
                            <section
                                key={stat.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.title}
                                        </p>
                                        <p className="mt-3 text-3xl font-bold tracking-tight">
                                            {statsLoading
                                                ? "..."
                                                : statsError
                                                    ? "—"
                                                    : (stat.value ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl font-semibold text-indigo-600">
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-slate-400">
                                    {stat.description}
                                </p>
                            </section>
                        ))}
                    </div>
                                       
                    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Maintenance Mode
                            </p>

                            <div className="mt-3">
                                {settingsLoading ? (
                                    <p className="text-sm text-slate-400">Loading...</p>
                                ) : settingsError ? (
                                    <p className="text-sm text-red-600">
                                        Unable to load status
                                    </p>
                                ) : (
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                            platformSettings?.maintenanceMode
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-emerald-50 text-emerald-700"
                                        }`}
                                    >
                                        {platformSettings?.maintenanceMode ? "ON" : "OFF"}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-xs text-slate-400">
                                Controls access to regular user features.
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                New User Registration
                            </p>

                            <div className="mt-3">
                                {settingsLoading ? (
                                    <p className="text-sm text-slate-400">Loading...</p>
                                ) : settingsError ? (
                                    <p className="text-sm text-red-600">
                                        Unable to load status
                                    </p>
                                ) : (
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                            platformSettings?.allowRegistration
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {platformSettings?.allowRegistration
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-xs text-slate-400">
                                Indicates whether new accounts can be created.
                            </p>
                        </section>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold">Platform activity</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Real registrations, reports, and moderation events.
                                    </p>
                                </div>

                                <select
                                    value={activityDays}
                                    onChange={(event) =>
                                        setActivityDays(Number(event.target.value))
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    aria-label="Activity date range"
                                >
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                </select>
                            </div>

                            {activityError && (
                                <p
                                    role="alert"
                                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {activityError}
                                </p>
                            )}

                            {activityLoading ? (
                                <div className="flex min-h-48 items-center justify-center">
                                    <p className="text-sm text-slate-500">
                                        Loading platform activity...
                                    </p>
                                </div>
                            ) : activityError ? (
                                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                    <p className="font-medium text-slate-700">
                                        Activity data unavailable
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Check the activity API and try again.
                                    </p>
                                </div>
                            ) : activity ? (
                                <>
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">
                                                Recently seen offline
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {(
                                                    activity.recentlySeenUsers ?? 0
                                                ).toLocaleString()}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {activity.recentlySeenLabel ||
                                                    "Based on recorded last-seen timestamps"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <p className="text-sm text-slate-500">
                                                Pending reports
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {(activity.pendingReports ?? 0).toLocaleString()}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Reports awaiting review
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="font-semibold text-slate-800">
                                                User registrations
                                            </h4>
                                            <span className="text-xs text-slate-400">
                                                {activityDays}-day view
                                            </span>
                                        </div>

                                        {activity.registrationChart?.length > 0 ? (
                                            <div
                                                className="mt-5 flex h-44 items-end gap-1.5 border-b border-slate-200 pb-2 sm:gap-2"
                                                role="img"
                                                aria-label={`Daily user registrations over the last ${activityDays} days`}
                                            >
                                                {activity.registrationChart.map((item) => {
                                                    const maxValue = Math.max(
                                                        1,
                                                        ...activity.registrationChart.map(
                                                            (entry) => entry.registrations ?? 0
                                                        )
                                                    );

                                                    const count = item.registrations ?? 0;
                                                    const height = count
                                                        ? Math.max(8, (count / maxValue) * 100)
                                                        : 0;

                                                    return (
                                                        <div
                                                            key={item.date}
                                                            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                                            title={`${item.date}: ${count} registration${count === 1 ? "" : "s"}`}
                                                        >
                                                            <span className="text-[10px] font-medium text-slate-500">
                                                                {count || ""}
                                                            </span>

                                                            <div className="flex h-full w-full items-end justify-center">
                                                                <div
                                                                    className={`w-full max-w-7 rounded-t-md transition-all ${
                                                                        count
                                                                            ? "bg-indigo-500 hover:bg-indigo-600"
                                                                            : "bg-slate-100"
                                                                    }`}
                                                                    style={{
                                                                        height: count
                                                                            ? `${height}%`
                                                                            : "3px",
                                                                    }}
                                                                />
                                                            </div>

                                                            <span className="text-[9px] text-slate-400 sm:text-[10px]">
                                                                {item.date?.slice(5) ?? ""}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="mt-4 text-sm text-slate-500">
                                                No registration data is available for this period.
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="font-semibold text-slate-800">
                                                Recent activity
                                            </h4>
                                            <span className="text-xs text-slate-400">
                                                Latest events
                                            </span>
                                        </div>

                                        {activity.recentActivity?.length > 0 ? (
                                            <div className="mt-4 divide-y divide-slate-100">
                                                {activity.recentActivity.slice(0, 5).map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-start gap-3 py-3"
                                                    >
                                                        <div
                                                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                                                                item.type === "registration"
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : item.type === "report"
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : "bg-indigo-50 text-indigo-700"
                                                            }`}
                                                        >
                                                            {item.type === "registration"
                                                                ? "+"
                                                                : item.type === "report"
                                                                ? "!"
                                                                : "✓"}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="break-words text-sm font-medium text-slate-700">
                                                                {item.message}
                                                            </p>

                                                            <p className="mt-1 text-xs capitalize text-slate-400">
                                                                {item.type}
                                                                {item.status
                                                                    ? ` · ${item.status}`
                                                                    : ""}
                                                                {" · "}
                                                                {item.createdAt
                                                                    ? new Date(
                                                                        item.createdAt
                                                                    ).toLocaleString()
                                                                    : "Date unavailable"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                                <p className="text-sm font-medium text-slate-600">
                                                    No recent activity
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Events will appear here when recorded in Nexora.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                    <p className="text-sm text-slate-500">
                                        No activity data is available.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="font-bold">Admin account</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Current session details
                            </p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400">Name</p>
                                    <p className="mt-1 break-words text-sm font-semibold">
                                        {admin?.name || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Email</p>
                                    <p className="mt-1 break-words text-sm font-semibold">
                                        {admin?.email || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Role</p>
                                    <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                                        {admin?.role || "admin"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Account status</p>
                                    <span
                                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            admin?.isActive
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {admin?.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Nexora Admin Console
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;