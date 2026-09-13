import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
    const location = useLocation();

    const isChatPage =
        location.pathname.startsWith("/messages/");

    return (
        <div className="h-screen bg-slate-50">
            <div className="flex h-full min-h-0">
                <Sidebar />

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <div className="shrink-0">
                        <Topbar />
                    </div>

                    <main
                        className={
                            isChatPage
                                ? "min-h-0 flex-1 overflow-hidden p-4 sm:p-6 lg:p-8"
                                : "min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
                        }
                    >
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;