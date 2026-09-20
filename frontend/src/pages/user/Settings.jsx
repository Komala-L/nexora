import { useEffect, useState } from "react";
import {
    Settings as SettingsIcon,
    Compass,
    Users,
    BriefcaseBusiness,
    GraduationCap,
    ShieldCheck,
    ChevronRight,
    Eye,
    EyeOff,
} from "lucide-react";

import {
    getSettings,
    updateSettings,
} from "../../services/settings.service";

import { changePassword } from "../../services/security.service";

const preferenceOptions = [
    {
        value: "friends",
        label: "Friends",
        description: "Discover people who are looking to make new connections.",
        icon: Users,
    },
    {
        value: "professional",
        label: "Professional",
        description: "Discover people based on professional interests and goals.",
        icon: BriefcaseBusiness,
    },
    {
        value: "learning",
        label: "Learning",
        description: "Discover people with similar learning interests and goals.",
        icon: GraduationCap,
    },
];

const Settings = () => {
    const [discoveryPreferences, setDiscoveryPreferences] = useState([]);
    const [isDiscoverable, setIsDiscoverable] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                setError("");

                const response = await getSettings();

                setDiscoveryPreferences(
                    response.data.settings.discoveryPreferences || []
                );

                setIsDiscoverable(
                    response.data.settings.isDiscoverable ?? true
                );
            } catch (error) {
                setError(
                    error.message || "Failed to load settings"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handlePreferenceToggle = (value) => {
        setDiscoveryPreferences((current) => {
            if (current.includes(value)) {
                return current.filter((item) => item !== value);
            }

            if (current.length >= 3) {
                return current;
            }

            return [...current, value];
        });
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((current) => ({
            ...current,
            [name]: value,
        }));

        setPasswordError("");
        setPasswordSuccess("");
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError("");
            setSuccessMessage("");

            const response = await updateSettings({
                discoveryPreferences,
                isDiscoverable,
            });

            setDiscoveryPreferences(
                response.data.settings.discoveryPreferences
            );

            setIsDiscoverable(
                response.data.settings.isDiscoverable
            );

            setSuccessMessage(
                "Settings updated successfully."
            );
        } catch (error) {
            setError(
                error.message || "Failed to update settings"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        try {
            setIsChangingPassword(true);
            setPasswordError("");
            setPasswordSuccess("");

            await changePassword(passwordData);

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setPasswordSuccess(
                "Password changed successfully."
            );
        } catch (error) {
            setPasswordError(
                error.message || "Failed to change password"
            );
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <SettingsIcon size={22} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your Nexora preferences and account settings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Navigation */}
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                {/* Sidebar */}
                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 text-left text-sm font-semibold text-indigo-700"
                    >
                        <div className="flex items-center gap-3">
                            <Compass size={18} />
                            <span>Discovery</span>
                        </div>

                        <ChevronRight size={16} />
                    </button>

                    <div className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400">
                        <ShieldCheck size={18} />
                        <span>Security</span>
                    </div>
                </aside>

                {/* Main Settings */}
                <main className="space-y-6">
                    {isLoading && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                            Loading your settings...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
                            {successMessage}
                        </div>
                    )}

                    {/* Discovery Preferences */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                <Compass size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Discovery Preferences
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Choose the types of connections you want
                                    Nexora to help you discover.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {preferenceOptions.map((option) => {
                                const Icon = option.icon;
                                const selected =
                                    discoveryPreferences.includes(option.value);

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handlePreferenceToggle(option.value)
                                        }
                                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                            selected
                                                ? "border-indigo-200 bg-indigo-50/60"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                                selected
                                                    ? "bg-indigo-100 text-indigo-600"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            <Icon size={19} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                {option.label}
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {option.description}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                selected
                                                    ? "border-indigo-600 bg-indigo-600"
                                                    : "border-slate-300 bg-white"
                                            }`}
                                        >
                                            {selected && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-xs leading-5 text-slate-500">
                                You can select one or more discovery purposes.
                                Your choices influence the people shown in
                                your discovery experience.
                            </p>
                        </div>

                        {/* Save Button - API integration comes next */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || isLoading || discoveryPreferences.length === 0}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </section>

                   {/* Privacy */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={20} />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Privacy
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Control how your profile participates in Nexora's
                                    discovery experience.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-6 rounded-xl border border-slate-200 p-4">
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Appear in Discovery
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Allow other users to discover your profile based on
                                    your discovery preferences and location.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={isDiscoverable}
                                onClick={() =>
                                    setIsDiscoverable((current) => !current)
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                                    isDiscoverable
                                        ? "bg-indigo-600"
                                        : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
                                        isDiscoverable
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-xs leading-5 text-slate-500">
                                {isDiscoverable
                                    ? "Your profile can currently appear in discovery results."
                                    : "Your profile is hidden from discovery results."}
                            </p>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <ShieldCheck size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Security
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Keep your Nexora account secure by managing
                                    your password.
                                </p>
                            </div>
                        </div>

                        {passwordError && (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                                {passwordSuccess}
                            </div>
                        )}

                        <form
                            onSubmit={handleChangePassword}
                            className="mt-6 space-y-5"
                        >
                            {/* Current Password */}
                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Current Password
                                </label>

                                <div className="relative mt-2">
                                    <input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your current password"
                                        autoComplete="off"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword((current) => !current)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                        aria-label={
                                            showCurrentPassword
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    New Password
                                </label>

                               <div className="relative mt-2">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword((current) => !current)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                        aria-label={
                                            showNewPassword
                                                ? "Hide new password"
                                                : "Show new password"
                                        }
                                    >
                                        {showNewPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Confirm New Password
                                </label>

                                <div className="relative mt-2">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm your new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword((current) => !current)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Change Password Button */}
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isChangingPassword
                                        ? "Changing Password..."
                                        : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Settings;