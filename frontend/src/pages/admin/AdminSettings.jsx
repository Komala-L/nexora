import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    getAdminSettings,
    updateAdminSettings,
} from "../../services/adminSettings.service";

const initialSettings = {
    platformName: "Nexora",
    tagline: "Expand your Orbit",
    supportEmail: "",
    maintenanceMode: false,
    allowRegistration: true,
};

const AdminSettings = () => {
    const [settings, setSettings] = useState(initialSettings);
    const [savedSettings, setSavedSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                const response = await getAdminSettings();
                const fetchedSettings = {
                    ...initialSettings,
                    ...response.data.settings,
                };

                setSettings(fetchedSettings);
                setSavedSettings(fetchedSettings);
            } catch (error) {
                setMessage(error.message || "Failed to load settings.");
                setMessageType("error");
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const updateSetting = (key, value) => {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));
        setMessage("");
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const payload = {
                platformName: settings.platformName,
                tagline: settings.tagline,
                supportEmail: settings.supportEmail,
                maintenanceMode: settings.maintenanceMode,
                allowRegistration: settings.allowRegistration,
            };

            const response = await updateAdminSettings(payload);
            const updatedSettings = {
                ...initialSettings,
                ...response.data.settings,
            };

            setSettings(updatedSettings);
            setSavedSettings(updatedSettings);
            setMessage(response.message || "Settings saved successfully.");
            setMessageType("success");
        } catch (error) {
            setMessage(error.message || "Failed to save settings.");
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(savedSettings);
        setMessage("");
    };

    const Toggle = ({ label, description, checked, onChange }) => (
        <div className="flex items-center justify-between gap-4 py-4">
            <div>
                <p className="text-sm font-semibold text-slate-800">
                    {label}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-label={label}
                aria-checked={checked}
                disabled={loading || saving}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    checked ? "bg-indigo-600" : "bg-slate-300"
                }`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        checked ? "left-6" : "left-1"
                    }`}
                />
            </button>
        </div>
    );

    return (
        <AdminLayout title="Settings">
            <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <p className="text-sm text-slate-500">
                        Configure your platform and administrative preferences.
                    </p>
                </div>

                {message && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`rounded-xl border p-4 text-sm ${
                            messageType === "error"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-green-200 bg-green-50 text-green-800"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {loading ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
                    >
                        Loading settings...
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <fieldset
                            disabled={saving}
                            className="min-w-0 space-y-6 disabled:opacity-70"
                        >
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        General settings
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Manage your platform's identity and support contact.
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-medium text-slate-700">
                                            Platform name
                                        </span>
                                        <input
                                            value={settings.platformName}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "platformName",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            maxLength={60}
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-medium text-slate-700">
                                            Tagline
                                        </span>
                                        <input
                                            value={settings.tagline}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "tagline",
                                                    e.target.value
                                                )
                                            }
                                            maxLength={120}
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Support email
                                        </span>
                                        <input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "supportEmail",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="support@example.com"
                                            maxLength={254}
                                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </label>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <div className="mb-2">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Platform controls
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Configure registration and maintenance preferences.
                                    </p>
                                </div>

                                <Toggle
                                    label="Allow new registrations"
                                    description="Allow new users to create Nexora accounts."
                                    checked={settings.allowRegistration}
                                    onChange={(value) =>
                                        updateSetting("allowRegistration", value)
                                    }
                                />

                                <div className="border-t border-slate-100">
                                    <Toggle
                                        label="Maintenance mode"
                                        description="Intended to temporarily restrict platform access during maintenance."
                                        checked={settings.maintenanceMode}
                                        onChange={(value) =>
                                            updateSetting("maintenanceMode", value)
                                        }
                                    />
                                </div>

                                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                                    These preferences are saved to the database.
                                    Registration and maintenance restrictions must
                                    also be enforced by the backend to affect
                                    actual platform behavior.
                                </p>
                            </section>
                        </fieldset>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleReset}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;