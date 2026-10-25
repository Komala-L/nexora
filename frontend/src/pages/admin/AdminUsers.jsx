import { useEffect, useState } from "react";
import { getAdminUsers, getAdminUserById } from "../../services/adminUser.service";

const PAGE_SIZE = 10;

const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const StatusBadge = ({ enabled, yes = "Enabled", no = "Disabled" }) => (
    <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            enabled
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
        }`}
    >
        {enabled ? yes : no}
    </span>
);

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    const handleViewProfile = async (userId) => {
        setSelectedUser(null);
        setProfileError("");
        setProfileLoading(true);

        try {
            const response = await getAdminUserById(userId);
            setSelectedUser(response?.data?.user ?? null);

            if (!response?.data?.user) {
                setProfileError("User profile data was not returned.");
            }
        } catch (error) {
            setProfileError(error.message || "Unable to load user profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleCloseProfile = () => {
        setSelectedUser(null);
        setProfileError("");
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;

        const fetchUsers = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await getAdminUsers({
                    page,
                    limit: PAGE_SIZE,
                    search,
                });

                if (cancelled) return;

                const payload = response?.data ?? response;
                const fetchedUsers = Array.isArray(payload?.users)
                    ? payload.users
                    : [];
                const pagination = payload?.pagination ?? {};
                const resultTotal = Number(
                    pagination.total ??
                    pagination.totalUsers ??
                    payload?.total ??
                    fetchedUsers.length
                );

                setUsers(fetchedUsers);
                setTotal(resultTotal);
                setTotalPages(
                    Math.max(
                        1,
                        Number(
                            pagination.totalPages ??
                            Math.ceil(resultTotal / PAGE_SIZE)
                        )
                    )
                );
            } catch (err) {
                if (!cancelled) {
                    setUsers([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError(err.message || "Unable to load users.");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchUsers();

        return () => {
            cancelled = true;
        };
    }, [page, search, reloadKey]);

    return (
        <>
            {profileLoading || profileError || selectedUser ? (
                <div className="w-full p-5 sm:p-6 lg:p-8">
                    <button
                        type="button"
                        onClick={handleCloseProfile}
                        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        ← Back to Users
                    </button>

                    {profileLoading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                            Loading user profile…
                        </div>
                    )}

                    {!profileLoading && profileError && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {profileError}
                        </div>
                    )}

                    {!profileLoading && selectedUser && (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
                                {selectedUser.profilePic?.url ? (
                                    <img
                                        src={selectedUser.profilePic.url}
                                        alt=""
                                        className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-700">
                                        {(selectedUser.name || selectedUser.email || "?")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {selectedUser.name || "Unnamed user"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {selectedUser.email || "No email"}
                                    </p>
                                    <p className="mt-2 text-sm capitalize text-slate-600">
                                        {selectedUser.gender || "Gender not provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6 sm:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Profile status
                                    </p>
                                    <p className="mt-2 font-semibold text-slate-800">
                                        {selectedUser.profileCompleted
                                            ? "Completed"
                                            : "Incomplete"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Discovery status
                                    </p>
                                    <p className="mt-2 font-semibold text-slate-800">
                                        {selectedUser.isDiscoverable &&
                                        selectedUser.discoveryEnabled
                                            ? "Enabled"
                                            : "Disabled"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                                    <h3 className="font-semibold text-slate-800">
                                        About
                                    </h3>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                        {selectedUser.bio || "No bio provided."}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <h3 className="font-semibold text-slate-800">
                                        Account created
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {formatDate(selectedUser.createdAt)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <h3 className="font-semibold text-slate-800">
                                        Last updated
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        {formatDate(selectedUser.updatedAt)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                                    <h3 className="font-semibold text-slate-800">
                                        Interests
                                    </h3>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {Array.isArray(selectedUser.interests) &&
                                        selectedUser.interests.length > 0 ? (
                                            selectedUser.interests.map(
                                                (interest, index) => (
                                                    <span
                                                        key={`${typeof interest === "string" ? interest : interest?.name || "interest"}-${index}`}
                                                        className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                                                    >
                                                        {typeof interest === "string"
                                                            ? interest
                                                            : interest?.name || "Interest"}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No interests added.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="w-full p-5 sm:p-6 lg:p-8">
                    <div className="mb-7">
                        <p className="text-sm font-semibold text-indigo-600">
                            COMMUNITY
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight">
                            Registered users
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Search accounts and review profile and discovery status.
                        </p>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-bold">All users</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {isLoading
                                        ? "Loading user records…"
                                        : `${total.toLocaleString()} user${total === 1 ? "" : "s"} found`}
                                </p>
                            </div>

                            <div className="relative w-full sm:max-w-sm">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    ⌕
                                </span>
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search name or email…"
                                    aria-label="Search users by name or email"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput("")}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                            >
                                <p className="font-semibold">
                                    Couldn't load users
                                </p>
                                <p className="mt-1">{error}</p>
                                <button
                                    type="button"
                                    onClick={() => setReloadKey((current) => current + 1)}
                                    className="mt-3 font-semibold underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">User</th>
                                        <th className="px-5 py-4 font-semibold">Gender</th>
                                        <th className="px-5 py-4 font-semibold">Profile</th>
                                        <th className="px-5 py-4 font-semibold">Discovery</th>
                                        <th className="px-5 py-4 font-semibold">Joined</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-16 text-center text-slate-500"
                                            >
                                                <span className="inline-block animate-pulse">
                                                    Loading users…
                                                </span>
                                            </td>
                                        </tr>
                                    ) : error ? null : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-16 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                                                    ⌕
                                                </div>
                                                <p className="mt-3 font-semibold text-slate-700">
                                                    No users found
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Try another name or email address.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user._id}
                                                onClick={() => handleViewProfile(user._id)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter") {
                                                        handleViewProfile(user._id);
                                                    }
                                                }}
                                                tabIndex={0}
                                                className="cursor-pointer transition hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                                title="Click to view user profile"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.profilePic?.url ? (
                                                            <img
                                                                src={user.profilePic.url}
                                                                alt=""
                                                                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
                                                                {(user.name || user.email || "?")
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="max-w-xs truncate font-semibold text-slate-800">
                                                                {user.name || "Unnamed user"}
                                                            </p>
                                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                                {user.email || "No email"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 capitalize text-slate-600">
                                                    {user.gender || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        enabled={Boolean(user.profileCompleted)}
                                                        yes="Completed"
                                                        no="Incomplete"
                                                    />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        enabled={Boolean(
                                                            user.isDiscoverable &&
                                                            user.discoveryEnabled
                                                        )}
                                                    />
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Page {page} of {totalPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1 || isLoading}
                                    onClick={() =>
                                        setPage((current) => Math.max(1, current - 1))
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    disabled={page >= totalPages || isLoading}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(totalPages, current + 1)
                                        )
                                    }
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Nexora Admin Console
                    </p>
                </div>
            )}
        </>
    );
};

export default AdminUsers;