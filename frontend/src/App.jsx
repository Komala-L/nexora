import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/user/Home";

const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                element={<Navigate to="/register" replace />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route
                        path="/home"
                        element={<Home />}
                    />
                </Route>
            </Route>
        </Routes>
    );
};

export default App;