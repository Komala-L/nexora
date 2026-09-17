import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    MapPin,
    Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notification.service.js";

const Topbar = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [unreadCount, setUnreadCount] = useState(0);

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

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationsUpdated
        );

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationsUpdated
            );
        };
    }, [authLoading, user]);

    return (
        <header className="flex h-20 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
            {/* Search */}
            <div className="relative max-w-xl flex-1">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="search"
                    placeholder="Search people, interests or locations..."
                    className="w-full rounded-xl border border-transparent bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
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

                <span>Bangalore, Karnataka</span>

                <ChevronDown size={15} />
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