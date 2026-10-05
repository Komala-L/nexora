import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket/socket";
import {
    Bell,
    MapPin,
    Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notification.service.js";
import { searchUsers } from "../../services/user.service.js";

const Topbar = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [unreadCount, setUnreadCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchContainerRef = useRef(null);

    const userName = user?.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    const fetchUnreadCount = async () => {
        try {
            const data =
                await getUnreadNotificationCount();

            setUnreadCount(
                data.data?.count || 0
            );
        } catch (error) {
            console.error(
                "Failed to fetch unread notification count:",
                error
            );
        }
    };

    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        fetchUnreadCount();

        const handleNotificationsUpdated = () => {
            fetchUnreadCount();
        };

        const handleNewMessage = () => {
            setUnreadCount((previousCount) => {
                return previousCount + 1;
            });
        };

        const handleNotificationRead = () => {
            setUnreadCount((previousCount) => {
                return Math.max(
                    previousCount - 1,
                    0
                );
            });
        };

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationsUpdated
        );

        socket.on(
            "new-message",
            handleNewMessage
        );

        socket.on(
            "notification-read",
            handleNotificationRead
        );

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationsUpdated
            );

            socket.off(
                "new-message",
                handleNewMessage
            );

            socket.off(
                "notification-read",
                handleNotificationRead
            );
        };
    }, [authLoading, user]);

    useEffect(() => {
        const trimmedQuery =
            searchQuery.trim();

        if (!trimmedQuery) {
            setSearchResults([]);
            setSearchLoading(false);
            setSearchError("");
            setShowSearchResults(false);

            return;
        }

        setShowSearchResults(true);
        setSearchLoading(true);
        setSearchError("");

        const timer = setTimeout(async () => {
            try {
                const response =
                    await searchUsers(
                        trimmedQuery,
                        1,
                        10
                    );

                setSearchResults(
                    response.data?.users || []
                );
            } catch (error) {
                console.error(
                    "Failed to search users:",
                    error
                );

                setSearchResults([]);

                setSearchError(
                    error.message ||
                    "Failed to search users"
                );
            } finally {
                setSearchLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(
                    event.target
                )
            ) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    const handleSearchResultClick = (
        userId
    ) => {
        setShowSearchResults(false);
        setSearchQuery("");

        navigate(`/profile/${userId}`);
    };

    return (
        <header className="flex h-20 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
            {/* Search */}
            <div
                ref={searchContainerRef}
                className="relative max-w-xl flex-1"
            >
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                        setSearchQuery(
                            event.target.value
                        );
                    }}
                    onFocus={() => {
                        if (searchQuery.trim()) {
                            setShowSearchResults(true);
                        }
                    }}
                    onKeyDown={(event) => {
                        if (
                            event.key === "Escape"
                        ) {
                            setShowSearchResults(false);
                            event.currentTarget.blur();
                        }
                    }}
                    placeholder="Search people, interests or skills..."
                    className="w-full rounded-xl border border-transparent bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        
                        {/* Loading */}
                        {searchLoading && (
                            <div className="px-4 py-4 text-sm text-slate-500">
                                Searching...
                            </div>
                        )}

                        {/* Error */}
                        {!searchLoading &&
                            searchError && (
                                <div className="px-4 py-4 text-sm text-red-500">
                                    {searchError}
                                </div>
                            )}

                        {/* No Results */}
                        {!searchLoading &&
                            !searchError &&
                            searchResults.length === 0 && (
                                <div className="px-4 py-4 text-sm text-slate-500">
                                    No users found.
                                </div>
                            )}

                        {/* Results */}
                        {!searchLoading &&
                            !searchError &&
                            searchResults.length > 0 && (
                                <div className="max-h-80 overflow-y-auto py-2">
                                    {searchResults.map(
                                        (result) => {
                                            const name =
                                                result.name ||
                                                "User";

                                            const initial =
                                                name
                                                    .charAt(0)
                                                    .toUpperCase();

                                            return (
                                                <button
                                                    key={
                                                        result._id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleSearchResultClick(
                                                            result._id
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                                                >
                                                    {/* Profile Image */}
                                                    {result
                                                        .profilePic
                                                        ?.url ? (
                                                        <img
                                                            src={
                                                                result
                                                                    .profilePic
                                                                    .url
                                                            }
                                                            alt={
                                                                name
                                                            }
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                                                            {
                                                                initial
                                                            }
                                                        </div>
                                                    )}

                                                    {/* User Information */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {
                                                                name
                                                            }
                                                        </p>

                                                        <p className="truncate text-xs text-slate-500">
                                                            {result
                                                                .professional
                                                                ?.role ||
                                                                result
                                                                    .interests
                                                                    ?.slice(
                                                                        0,
                                                                        2
                                                                    )
                                                                    .join(
                                                                        " • "
                                                                    ) ||
                                                                "Nexora user"}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Location */}
            <button
                type="button"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 sm:flex"
            >
                <MapPin
                    size={16}
                    className="text-indigo-600"
                />

                <span>
                    {user?.locationDetails?.area
                    ? `${user.locationDetails.area}, ${user.locationDetails.city}`
                    : user?.locationDetails?.city || "Location not set"}
                </span>

            </button>

            {/* Notifications */}
            <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Notifications"
            >
                <Bell size={19} />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {/* User Avatar */}
            <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700"
                aria-label={`Open ${userName} profile`}
            >
                {userInitial}
            </button>
        </header>
    );
};

export default Topbar;