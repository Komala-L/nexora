import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="text-center">
                <h1 className="text-3xl font-bold">
                    Welcome to Nexora
                </h1>

                <p className="mt-3 text-slate-400">
                    Hello, {user?.name}
                </p>

                <button
                    onClick={handleLogout}
                    className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Home;