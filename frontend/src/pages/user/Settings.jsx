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
    UserRound,
} from "lucide-react";

import {
    getSettings,
    updateSettings,
} from "../../services/settings.service";

import { 
    changePassword,
    deleteAccount,
 } from "../../services/security.service";

import { getCurrentUser } from "../../services/user.service";

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
    const [activeSection, setActiveSection] = useState("discovery");
    const [accountData, setAccountData] = useState(null);
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showDeletePassword, setShowDeletePassword] = useState(false);

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

    useEffect(() => {
        const loadAccountData = async () => {
            try {
                const response = await getCurrentUser();

                setAccountData(response.data.user);
            } catch (error) {
                setError(
                    error.message || "Failed to load account information"
                );
            }
        };

        loadAccountData();
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
                    {/* Discovery */}
                    <button
                        type="button"
                        onClick={() => setActiveSection("discovery")}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                            activeSection === "discovery"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Compass size={18} />
                            <span>Discovery</span>
                        </div>

                        {activeSection === "discovery" && (
                            <ChevronRight size={16} />
                        )}
                    </button>

                    {/* Security */}
                    <button
                        type="button"
                        onClick={() => setActiveSection("security")}
                        className={`mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                            activeSection === "security"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} />
                            <span>Security</span>
                        </div>

                        {activeSection === "security" && (
                            <ChevronRight size={16} />
                        )}
                    </button>

                    {/* Account */}
                    <button
                        type="button"
                        onClick={() => setActiveSection("account")}
                        className={`mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                            activeSection === "account"
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <UserRound size={18} />
                            <span>Account</span>
                        </div>

                        {activeSection === "account" && (
                            <ChevronRight size={16} />
                        )}
                    </button>
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

                    {activeSection === "discovery" && (
                        <>
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
                        </>
                    )}

                    {/* Security */}
                    {activeSection === "security" && (
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
                    )}

                    {/* Account Information */}
                    {activeSection === "account" && (
                        <>
                            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <UserRound size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Account Information
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            View the information associated with your Nexora account.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {/* Name */}
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Name
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {accountData?.name || "—"}
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Email
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {accountData?.email || "—"}
                                        </p>
                                    </div>

                                    {/* Gender */}
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Gender
                                        </p>

                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                            {accountData?.gender || "—"}
                                        </p>
                                    </div>

                                    {/* Account Created */}
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Account Created
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {accountData?.createdAt
                                                ? new Date(
                                                    accountData.createdAt
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Danger Zone */}
                            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                        <ShieldCheck size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Danger Zone
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            Permanently delete your Nexora account and associated data.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between gap-6 rounded-xl border border-red-200 bg-red-50/40 p-4">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-red-700">
                                            Delete Account
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            This action cannot be undone. Your account and associated
                                            Nexora data will be permanently deleted.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteError("");
                                            setDeletePassword("");
                                            setDeleteConfirmation("");
                                            setShowDeletePassword(false);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="shrink-0 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Delete your account?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                This action is permanent. Your Nexora account and
                                associated data will be deleted and cannot be recovered.
                            </p>
                        </div>

                        {/* Current Password */}
                        <div className="mt-6">
                            <label
                                htmlFor="delete-current-password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Current Password
                            </label>

                            <div className="relative mt-2">
                                <input
                                    id="delete-current-password"
                                    name="delete-current-password"
                                    type={showDeletePassword ? "text" : "password"}
                                    value={deletePassword}
                                    onChange={(event) => {
                                        setDeletePassword(event.target.value);
                                        setDeleteError("");
                                    }}
                                    placeholder="Enter your current password"
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeletePassword((current) => !current)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    aria-label={
                                        showDeletePassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showDeletePassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div className="mt-4">
                            <label
                                htmlFor="delete-confirmation"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Type DELETE to confirm
                            </label>

                            <input
                                id="delete-confirmation"
                                type="text"
                                value={deleteConfirmation}
                                onChange={(event) => {
                                    setDeleteConfirmation(event.target.value);
                                    setDeleteError("");
                                }}
                                placeholder="DELETE"
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Error */}
                        {deleteError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {deleteError}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeletePassword("");
                                    setDeleteConfirmation("");
                                    setDeleteError("");
                                    setShowDeletePassword(false);
                                }}
                                disabled={isDeletingAccount}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    isDeletingAccount ||
                                    !deletePassword ||
                                    deleteConfirmation !== "DELETE"
                                }
                                onClick={async () => {
                                    try {
                                        setIsDeletingAccount(true);
                                        setDeleteError("");

                                        await deleteAccount(deletePassword);

                                        setIsDeleteModalOpen(false);

                                        window.location.href = "/register";
                                    } catch (error) {
                                        setDeleteError(
                                            error.message || "Failed to delete account."
                                        );
                                    } finally {
                                        setIsDeletingAccount(false);
                                    }
                                }}
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeletingAccount
                                    ? "Deleting..."
                                    : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;