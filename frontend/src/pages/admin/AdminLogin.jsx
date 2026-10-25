import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { loginAdmin } from "../../services/adminAuth.service";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { admin, isLoading, setAdmin } = useAdminAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isLoading && admin) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await loginAdmin({
                email: normalizedEmail,
                password,
            });

            const authenticatedAdmin = response?.data?.admin;

            if (!authenticatedAdmin) {
                throw new Error(
                    "Login succeeded, but administrator details were not returned."
                );
            }

            setAdmin(authenticatedAdmin);
            navigate("/admin", { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to sign in. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <section className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 text-2xl font-bold text-indigo-300 shadow-lg shadow-indigo-950/30">
                        <img
                            src="/images/nexora-logo.png"
                            alt="Nexora logo"
                            className="h-10 w-10 shrink-0 object-contain"
                        />
                    </div>

                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                        Nexora
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                        Admin Portal
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to manage and monitor your platform.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                            Welcome back
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Enter your administrator credentials.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="admin-email"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Email address
                            </label>

                            <input
                                id="admin-email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={isSubmitting}
                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                            />
                        </div>
                                                
                        <div>
                            <label
                                htmlFor="admin-password"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 transition hover:text-indigo-300 focus:outline-none focus:text-indigo-300"
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 3l18 18" />
                                            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a15.8 15.8 0 01-3 3.8" />
                                            <path d="M6.6 6.6C4.1 8.2 3 12 3 12s3.5 7 9 7a10 10 0 004.1-.9" />
                                        </svg>
                                    ) : (
                                        // Eye: password is hidden
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in to Admin Portal"
                            )}
                        </button>

                        <p className="mt-5 text-center text-sm text-slate-400">
                            Not an administrator?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-semibold text-indigo-300 transition hover:text-cyan-300"
                            >
                                Back to User Login
                            </button>
                        </p>
                    </form>

                    <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-center text-xs leading-5 text-slate-500">
                            Restricted access. Only authorized Nexora administrators
                            can sign in.
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-600">
                    Nexora Admin Portal
                </p>
            </section>
        </main>
    );
};

export default AdminLogin;