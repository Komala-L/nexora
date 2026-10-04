import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileOnboarding from "../user/ProfileOnboarding";

import {
    needsProfileCompletion,
    CURRENT_PROFILE_VERSION,
} from "../../utils/profileCompletion";

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

const ProfileCompletionGate = () => {
    const {
        user,
        isLoading,
        setUser,
    } = useAuth();

    const [skipped, setSkipped] = useState(false);

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

    if (!needsProfileCompletion(user)) {
        const storageKey = getSkipStorageKey(user);

        if (storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.error(
                    "Failed to clear profile onboarding skip state:",
                    error
                );
            }
        }

        return <Outlet />;
    }

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
                        localStorage.removeItem(storageKey);
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
                if (updatedUser) {
                    setUser(updatedUser);
                }

                setSkipped(true);
            }}
        />
    );
};

export default ProfileCompletionGate;