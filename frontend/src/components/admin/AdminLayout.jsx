import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const navigation = [
    { label: "Overview", icon: "◫", path: "/admin" },
    { label: "Users", icon: "♙", path: "/admin/users" },
    { label: "Reports", icon: "⚑", path: "/admin/reports" },
    { label: "Settings", icon: "⚙", path: "/admin/settings" },
];

const AdminLayout = ({ title, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, logoutAdmin } = useAdminAuth();

    const handleLogout = async () => {
        try {
            await logoutAdmin();
        } finally {
            navigate("/admin/login", { replace: true });
        }
    };

    const isActive = (path) => {
        if (!path) return false;
        if (path === "/admin") return location.pathname === "/admin";
        return location.pathname === path ||
            location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
                <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        N
                    </div>
                    <div>
                        <p className="text-lg font-extrabold tracking-[0.16em]">
                            NEXORA
                        </p>
                        <p className="text-xs text-slate-400">
                            ADMIN CONSOLE
                        </p>
                    </div>
                </div>

                <div className="px-4 pt-7">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    disabled={!item.path}
                                    onClick={() => {
                                        if (item.path) navigate(item.path);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : item.path
                                                ? "text-slate-600 hover:bg-slate-100"
                                                : "cursor-not-allowed text-slate-400"
                                    }`}
                                >
                                    <span className="text-lg">
                                        {item.icon}
                                    </span>
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

            {/* Main content */}
            <main className="min-w-0 flex-1">
                {/* Top navbar */}
                <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 sm:px-8">
                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Nexora / Administration
                        </p>
                        <h1 className="mt-1 text-lg font-bold">
                            {title}
                        </h1>
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

                {children}
            </main>
        </div>
    );
};

export default AdminLayout;