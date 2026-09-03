import { useState } from "react";
import { registerUser } from "../../services/auth.service";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters long.";
        } else if (formData.name.trim().length > 40) {
            newErrors.name = "Name cannot exceed 40 characters.";
        }

        if (!formData.gender) {
            newErrors.gender = "Please select your gender";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/.test(
                formData.password
            )
        ) {
            newErrors.password =
                "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match";
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
            const { confirmPassword, ...registrationData } = formData;

            const response = await registerUser(registrationData);

            console.log("Registration successful:", response);

            setSuccessMessage(
                response.message || "Account created successfully"
            );

            setFormData({
                name: "",
                gender: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Registration failed:", error);

            setServerError(
                error.message || "Registration failed. Please try again."
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
                            Create your account
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Server Error */}
                        {serverError && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {serverError}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                                {successMessage}
                            </div>
                        )}
                        
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />

                            {errors.name && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        
                        {/* Gender */}
                        <div>
                            <label
                                htmlFor="gender"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Gender
                            </label>

                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="" disabled>
                                    Select your gender
                                </option>

                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>

                            {errors.gender && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.gender}
                                </p>
                            )}
                        </div>

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
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                                        showConfirmPassword
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

                        
                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) => !previous
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="font-medium text-indigo-400 transition hover:text-indigo-300"
                        >
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;