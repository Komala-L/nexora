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
        <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
                <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Nexora
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Welcome back
                        </p>
                    </div>

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
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) => !previous
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
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
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="font-medium text-indigo-400 transition hover:text-indigo-300"
                        >
                            Create an account
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;