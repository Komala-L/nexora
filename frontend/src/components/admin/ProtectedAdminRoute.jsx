import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const ProtectedAdminRoute = () => {
    const { admin, isLoading } = useAdminAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Verifying administrator access...
                    </p>
                </div>
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!["admin", "superadmin"].includes(admin.role)) {
        return <Navigate to="/admin/login" replace />;
    }

    if (admin.isActive === false) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;