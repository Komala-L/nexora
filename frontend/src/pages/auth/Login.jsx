import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

const getServerErrorTitle = (message) => {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("permanently banned")) {
        return "Account Permanently Banned";
    }

    if (normalizedMessage.includes("temporarily suspended")) {
        return "Account Temporarily Suspended";
    }

    if (
        normalizedMessage.includes("suspended") ||
        normalizedMessage.includes("suspension")
    ) {
        return "Account Suspended";
    }

    return "Unable to Log In";
};

const Login = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setServerError("");
        setSuccessMessage("");

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await loginUser(formData);
            await checkAuth();
            navigate("/home");

        } catch (error) {
            console.error("Login failed:", error);

            setServerError(
                error.message || "Login failed. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <section className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 shadow-lg shadow-indigo-950/30">
                        <img
                            src="/images/nexora-logo.png"
                            alt="Nexora logo"
                            className="h-10 w-10 object-contain"
                        />
                    </div>

                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                        Nexora
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to continue expanding your orbit.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                    {serverError && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-red-100 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                                    <span className="text-lg" aria-hidden="true">⚠️</span>
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-red-200">
                                        {getServerErrorTitle(serverError)}
                                    </h2>

                                    <p className="mt-1 break-words text-sm leading-6 text-red-100">
                                        {serverError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            {successMessage}
                        </div>
                    )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />

                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 space-y-5">
                        <p className="text-center text-sm text-slate-400">
                            Don't have an account?{" "}
                            <a
                                href="/register"
                                className="font-semibold text-indigo-300 transition hover:text-cyan-300"
                            >
                                Create an account
                            </a>
                        </p>

                        <div className="border-t border-white/10 pt-5">
                            <p className="text-center text-xs text-slate-500">
                                Are you an administrator?
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/login")}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-200 transition hover:border-indigo-300/50 hover:bg-indigo-500/20 hover:text-white"
                            >
                                <span aria-hidden="true">↗</span>
                                Switch to Admin Portal
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;