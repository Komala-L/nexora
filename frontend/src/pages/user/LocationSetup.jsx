import { useState } from "react";
import {
    MapPin,
    ShieldCheck,
    Navigation,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import {
    syncUserLocation,
} from "../../services/location.service";

import {
    getCurrentUser,
} from "../../services/user.service";

const LocationSetup = ({
    user,
    onCompleted,
    onSkip,
}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");
    const [location, setLocation] = useState(null);

    const handleEnableLocation = async () => {
        try {
            setIsUpdating(true);
            setError("");

            await syncUserLocation();

            const response =
                await getCurrentUser();

            const updatedUser =
                response.data?.user;

            setLocation(
                updatedUser?.locationDetails ||
                    null
            );

            if (updatedUser) {
                onCompleted(updatedUser);
            }
        } catch (error) {
            console.error(
                "Failed to enable location:",
                error
            );

            setError(
                error.message ||
                    "Unable to determine your location."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-lg">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 px-7 py-10 text-white sm:px-10">
                        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

                        <div className="relative">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
                                <MapPin
                                    size={30}
                                    strokeWidth={2}
                                />
                            </div>

                            <h1 className="mt-6 text-3xl font-bold tracking-tight">
                                Enable your location
                            </h1>

                            <p className="mt-3 max-w-md text-sm leading-6 text-indigo-50">
                                Discover people around
                                you based on your
                                interests, goals and
                                proximity.
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-7 sm:p-10">
                        <div className="space-y-4">
                            {/* Privacy */}
                            <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <ShieldCheck
                                        size={20}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Your exact location
                                        stays private
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Nexora uses your
                                        location internally
                                        for discovery. Other
                                        users will not see
                                        your exact
                                        coordinates.
                                    </p>
                                </div>
                            </div>

                            {/* Discovery */}
                            <div className="flex gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <Navigation
                                        size={19}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Better discovery
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Find relevant people
                                        near your area,
                                        whether you're
                                        looking for friends,
                                        professional
                                        connections or
                                        learning partners.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-red-500"
                                />

                                <p className="text-sm leading-5 text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Success preview */}
                        {location && (
                            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                <CheckCircle2
                                    size={21}
                                    className="text-emerald-600"
                                />

                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Location detected
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {location.area
                                            ? `${location.area}, `
                                            : ""}
                                        {location.city ||
                                            "Location detected"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-7 space-y-3">
                            <button
                                type="button"
                                onClick={
                                    handleEnableLocation
                                }
                                disabled={
                                    isUpdating
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isUpdating ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Detecting location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin
                                            size={18}
                                        />

                                        Enable Location
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onSkip}
                                disabled={
                                    isUpdating
                                }
                                className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Maybe later
                            </button>
                        </div>

                        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
                            You can enable or update
                            your location later from
                            Nexora settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationSetup;