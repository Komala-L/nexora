import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileOnboarding from "../user/ProfileOnboarding";
import LocationSetup from "../user/LocationSetup";

import {
    needsProfileCompletion,
    CURRENT_PROFILE_VERSION,
} from "../../utils/profileCompletion";

import {
    hasLocation,
} from "../../utils/locationCompletion";


const getUserIdentifier = (user) => {
    return user?._id || user?.id || user?.email || null;
};

const getSkipStorageKey = (user) => {
    const userIdentifier = getUserIdentifier(user);

    if (!userIdentifier) {
        return null;
    }
    return `nexora:profile-onboarding-skipped:${userIdentifier}:v${CURRENT_PROFILE_VERSION}`;
};

const getLocationSkipKey = (user) => {
    const identifier = getUserIdentifier(user);

    if (!identifier) {
        return null;
    }
    return `nexora:location-skipped:${identifier}`;
};

const ProfileCompletionGate = () => {
    const {
        user,
        isLoading,
        setUser,
    } = useAuth();

    const [skipped, setSkipped] = useState(false);

    const [locationSkipped, setLocationSkipped] = useState(false);

    useEffect(() => {
        if (!user) {
            setSkipped(false);
            return;
        }

        const storageKey = getSkipStorageKey(user);

        if (!storageKey) {
            setSkipped(false);
            return;
        }

        try {
            const hasSkipped = localStorage.getItem(storageKey) === "true";
            setSkipped(hasSkipped);

        } catch (error) {
            console.error(
                "Failed to restore profile onboarding state:",
                error
            );
            setSkipped(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setLocationSkipped(false);
            return;
        }

        const key = getLocationSkipKey(user);
        if (!key) {
            setLocationSkipped(false);
            return;
        }
        try {
            setLocationSkipped(
                localStorage.getItem(key) === "true"
            );
        } catch (error) {
            console.error(
                "Failed to restore location preference:",
                error
            );
            setLocationSkipped(false);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Preparing your Nexora experience...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (needsProfileCompletion(user)) {
        if (skipped) {
            return <Outlet />;
        }

        return (
            <ProfileOnboarding
                user={user}

                onCompleted={(updatedUser) => {
                    const storageKey = getSkipStorageKey(user);

                    if (storageKey) {
                        try {
                            localStorage.removeItem(
                                storageKey
                            );
                        } catch (error) {
                            console.error(
                                "Failed to clear profile onboarding skip state:",
                                error
                            );
                        }
                    }
                    setSkipped(false);

                    setUser(updatedUser);
                }}

                onSkip={(updatedUser) => {
                    const userToUse = updatedUser || user;
                    const storageKey = getSkipStorageKey(userToUse);

                    if (updatedUser) {
                        setUser(updatedUser);
                    }

                    if (storageKey) {
                        try {
                            localStorage.setItem(storageKey, "true");
                        } catch (error) {
                            console.error(
                                "Failed to save profile onboarding skip state:",
                                error
                            );
                        }
                    }

                    setSkipped(true);
                }}
            />
        );
    }

    if (!hasLocation(user)) {
        if (locationSkipped) {
            return <Outlet />;
        }

        return (
            <LocationSetup
                user={user}
                onCompleted={(updatedUser) => {
                    const key = getLocationSkipKey(user);

                    if (key) {
                        try {
                            localStorage.removeItem(
                                key
                            );
                        } catch (error) {
                            console.error(
                                "Failed to clear location skip state:",
                                error
                            );
                        }
                    }
                    setLocationSkipped(false);

                    setUser(updatedUser);
                }}

                onSkip={() => {
                    const key =
                        getLocationSkipKey(user);

                    if (key) {
                        try {
                            localStorage.setItem(
                                key,
                                "true"
                            );
                        } catch (error) {
                            console.error(
                                "Failed to save location preference:",
                                error
                            );
                        }
                    }
                  setLocationSkipped(true);
                }}
            />
        );
    }

    return <Outlet />;
};

export default ProfileCompletionGate;