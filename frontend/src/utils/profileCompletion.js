export const CURRENT_PROFILE_VERSION = 1;
export const needsProfileCompletion = (user) => {
    if (!user) {
        return true;
    }

    const hasName =
        typeof user.name === "string" &&
        user.name.trim().length > 0;

    const hasDiscoveryPreference =
        Array.isArray(user.discoveryPreferences) &&
        user.discoveryPreferences.length > 0;

    const hasRequiredInformation =
        hasName &&
        hasDiscoveryPreference;

    if (!hasRequiredInformation) {
        return true;
    }

    const isCurrentProfile =
        user.profileCompleted === true &&
        Number(user.profileVersion) >=
            CURRENT_PROFILE_VERSION;

    return !isCurrentProfile;
};