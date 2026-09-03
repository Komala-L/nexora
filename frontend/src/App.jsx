import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";

const App = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/register" replace />}
            />

            {/* Public Routes */}
            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/home"
                    element={<Home />}
                />
            </Route>
        </Routes>
    );
};

export default App;