import {
    Bell,
    Compass,
    Home,
    Settings,
    User,
    Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigationItems = [
    {
        label: "Home",
        path: "/home",
        icon: Home,
    },
    {
        label: "Discover",
        path: "/discover",
        icon: Compass,
    },
    {
        label: "Connections",
        path: "/connections",
        icon: Users,
    },
    {
        label: "Requests",
        path: "/requests",
        icon: Bell,
        badge: 3,
    },
    {
        label: "Profile",
        path: "/profile",
        icon: User,
    },
    {
        label: "Settings",
        path: "/settings",
        icon: Settings,
    },
];

const Sidebar = () => {
    const { user } = useAuth();

    const userName = user?.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
            {/* Brand */}
            <div className="flex h-20 items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        N
                    </div>

                    <span className="text-lg font-bold tracking-[0.16em] text-slate-900">
                        NEXORA
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-5">
                <div className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`
                                }
                            >
                                <Icon size={18} strokeWidth={2} />

                                <span className="flex-1">
                                    {item.label}
                                </span>

                                {item.badge && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* User Mini Profile */}
            <div className="border-t border-slate-200 p-4">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {userInitial}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {userName}
                        </p>

                        <p className="text-xs text-slate-500">
                            View profile
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;