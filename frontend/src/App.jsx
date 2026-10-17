import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileCompletionGate from "./pages/auth/ProfileCompletionGate";
import AppLayout from "./components/layout/AppLayout";

import Home from "./pages/user/Home";
import Requests from "./pages/user/Requests";
import Connections from "./pages/user/Connections";
import Profile from "./pages/user/Profile";
import Discover from "./pages/user/Discover";
import MyProfile from "./pages/user/MyProfile";
import Messages from "./pages/user/Messages";
import Chat from "./pages/user/Chat";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

import ModerationNoticeManager from "./components/ModerationNoticeManager";

import LandingPage from "./pages/public/LandingPage";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";

const App = () => {
    return (
        <Routes>
            {/* PUBLIC ROUTES */}

            <Route
                path="/"
                element={<LandingPage />}
            />

            <Route
                path="/privacy-policy"
                element={<PrivacyPolicy />}
            />

            <Route
                path="/terms-of-service"
                element={<TermsOfService />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            
            {/* SHARED ADMIN AUTHENTICATION */}
            <Route
                path="/admin"
                element={
                    <AdminAuthProvider>
                        <Outlet />
                    </AdminAuthProvider>
                }
            >
                {/* Public admin login */}
                <Route
                    path="login"
                    element={<AdminLogin />}
                />

                {/* Protected admin pages */}
                <Route element={<ProtectedAdminRoute />}>
                    <Route
                        index
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="users"
                        element={<AdminUsers />}
                    />

                     <Route 
                        path="reports" 
                        element={<AdminReports />} 
                    />

                    <Route 
                        path="settings" 
                        element={<AdminSettings />} 
                    />
                </Route>
            </Route>


            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
                <Route element={<ProfileCompletionGate />}>
                    <Route
                        element={
                            <>
                                <ModerationNoticeManager />
                                <AppLayout />
                            </>
                        }
                    >

                        <Route
                            path="/home"
                            element={<Home />}
                        />

                        <Route
                            path="/discover"
                            element={<Discover />}
                        />

                        <Route
                            path="/requests"
                            element={<Requests />}
                        />

                        <Route
                            path="/connections"
                            element={<Connections />}
                        />

                        <Route
                            path="/messages"
                            element={<Messages />}
                        />

                        <Route
                            path="/messages/:conversationId"
                            element={<Chat />}
                        />

                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />

                        <Route
                            path="/profile"
                            element={<MyProfile />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />

                        <Route
                            path="/users/:userId"
                            element={<Profile />}
                        />

                        <Route
                            path="/profile/:userId"
                            element={<Profile />}
                        />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default App;