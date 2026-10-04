// export const getProfileCompletion = (user) => {
//     if (!user) {
//         return {
//             percentage: 0,
//             completed: 0,
//             total: 6,
//             missing: [],
//         };
//     }

//     const hasProfilePicture = Boolean(
//         user?.profilePic?.url
//     );

//     const hasBasicInfo =
//         Boolean(user?.name?.trim()) &&
//         Boolean(user?.bio?.trim());

//     const hasInterests =
//         Array.isArray(user?.interests) &&
//         user.interests.length > 0;

//     const hasProfessionalInfo =
//         Boolean(user?.professional?.role?.trim()) ||
//         Boolean(user?.professional?.company?.trim()) ||
//         Boolean(user?.professional?.industry?.trim()) ||
//         (
//             Array.isArray(user?.professional?.skills) &&
//             user.professional.skills.length > 0
//         );

//     const hasLearningInfo =
//         Boolean(user?.learning?.learningGoal?.trim()) ||
//         (
//             Array.isArray(user?.learning?.subjects) &&
//             user.learning.subjects.length > 0
//         );

//     const hasDiscoveryPreferences =
//         Array.isArray(user?.discoveryPreferences) &&
//         user.discoveryPreferences.length > 0;

//     const sections = [
//         {
//             key: "profilePicture",
//             label: "Profile picture",
//             completed: hasProfilePicture,
//         },
//         {
//             key: "basicInfo",
//             label: "About you",
//             completed: hasBasicInfo,
//         },
//         {
//             key: "interests",
//             label: "Interests",
//             completed: hasInterests,
//         },
//         {
//             key: "professional",
//             label: "Professional information",
//             completed: hasProfessionalInfo,
//         },
//         {
//             key: "learning",
//             label: "Learning information",
//             completed: hasLearningInfo,
//         },
//         {
//             key: "discoveryPreferences",
//             label: "Discovery preferences",
//             completed: hasDiscoveryPreferences,
//         },
//     ];

//     const completedSections = sections.filter(
//         (section) => section.completed
//     ).length;

//     const percentage = Math.round(
//         (completedSections / sections.length) * 100
//     );

//     return {
//         percentage,
//         completed: completedSections,
//         total: sections.length,
//         missing: sections
//             .filter((section) => !section.completed)
//             .map((section) => section.label),
//     };
// };

// export const isProfileReady = (user) => {
//     if (!user) {
//         return false;
//     }

//     const hasBasicInfo =
//         Boolean(user?.name?.trim()) &&
//         Boolean(user?.bio?.trim());

//     const hasInterests =
//         Array.isArray(user?.interests) &&
//         user.interests.length > 0;

//     const hasProfessionalInfo =
//         Boolean(user?.professional?.role?.trim()) ||
//         Boolean(user?.professional?.company?.trim()) ||
//         Boolean(user?.professional?.industry?.trim()) ||
//         (
//             Array.isArray(user?.professional?.skills) &&
//             user.professional.skills.length > 0
//         );

//     const hasLearningInfo =
//         Boolean(user?.learning?.learningGoal?.trim()) ||
//         (
//             Array.isArray(user?.learning?.subjects) &&
//             user.learning.subjects.length > 0
//         );

//     const hasDiscoveryPreferences =
//         Array.isArray(user?.discoveryPreferences) &&
//         user.discoveryPreferences.length > 0;

//     return (
//         hasBasicInfo &&
//         hasInterests &&
//         hasProfessionalInfo &&
//         hasLearningInfo &&
//         hasDiscoveryPreferences
//     );
// };


// /* --------------------------------------------------
//    PROFILE ONBOARDING GATE
// -------------------------------------------------- */
// export const isProfileOnboardingComplete = (user) => {
//     if (!user) {
//         return false;
//     }

//     // These are the fields that must be completed
//     // before the user can enter Nexora.
//     const hasName =
//         Boolean(user?.name?.trim());

//     const hasDiscoveryPreferences =
//         Array.isArray(user?.discoveryPreferences) &&
//         user.discoveryPreferences.length > 0;

//     return (
//         hasName &&
//         hasDiscoveryPreferences
//     );
// };


















// export const isProfileOnboardingComplete = (user) => {
//     if (!user) {
//         return false;
//     }

//     // Mandatory requirement #1:
//     // User must have a valid name.
//     const hasName =
//         typeof user?.name === "string" &&
//         user.name.trim().length >= 3;

//     // Mandatory requirement #2:
//     // User must select at least one discovery preference.
//     const hasDiscoveryPreferences =
//         Array.isArray(user?.discoveryPreferences) &&
//         user.discoveryPreferences.length > 0;

//     return (
//         hasName &&
//         hasDiscoveryPreferences
//     );
// };


// export const getProfileCompletion = (user) => {
//     if (!user) {
//         return {
//             percentage: 0,
//             completed: 0,
//             total: 6,
//             missing: [],
//             onboardingComplete: false,
//         };
//     }

//     /*
//      * These sections are used only for
//      * PROFILE STRENGTH.
//      *
//      * They are NOT all mandatory for onboarding.
//      */

//     const hasProfilePicture = Boolean(
//         user?.profilePic?.url
//     );

//     const hasBasicInfo =
//         Boolean(user?.name?.trim()) ||
//         Boolean(user?.bio?.trim());

//     const hasInterests =
//         Array.isArray(user?.interests) &&
//         user.interests.length > 0;

//     const hasProfessionalInfo =
//         Boolean(user?.professional?.role?.trim()) ||
//         Boolean(user?.professional?.company?.trim()) ||
//         Boolean(user?.professional?.industry?.trim()) ||
//         (
//             Array.isArray(user?.professional?.skills) &&
//             user.professional.skills.length > 0
//         );

//     const hasLearningInfo =
//         Boolean(user?.learning?.learningGoal?.trim()) ||
//         (
//             Array.isArray(user?.learning?.subjects) &&
//             user.learning.subjects.length > 0
//         );

//     const hasDiscoveryPreferences =
//         Array.isArray(user?.discoveryPreferences) &&
//         user.discoveryPreferences.length > 0;


//     const sections = [
//         {
//             key: "profilePicture",
//             label: "Profile picture",
//             completed: hasProfilePicture,
//             required: false,
//         },

//         {
//             key: "basicInfo",
//             label: "About you",
//             completed: hasBasicInfo,
//             required: true,
//         },

//         {
//             key: "interests",
//             label: "Interests",
//             completed: hasInterests,
//             required: false,
//         },

//         {
//             key: "professional",
//             label: "Professional information",
//             completed: hasProfessionalInfo,
//             required: false,
//         },

//         {
//             key: "learning",
//             label: "Learning information",
//             completed: hasLearningInfo,
//             required: false,
//         },

//         {
//             key: "discoveryPreferences",
//             label: "Discovery preferences",
//             completed: hasDiscoveryPreferences,
//             required: true,
//         },
//     ];


//     const completedSections = sections.filter(
//         (section) => section.completed
//     ).length;

//     const totalSections = sections.length;

//     const percentage = Math.round(
//         (completedSections / totalSections) * 100
//     );


//     return {
//         percentage,

//         completed: completedSections,

//         total: totalSections,

//         missing: sections
//             .filter((section) => !section.completed)
//             .map((section) => section.label),

//         onboardingComplete:
//             isProfileOnboardingComplete(user),
//     };
// };







export const CURRENT_PROFILE_VERSION = 1;

/**
 * Determines whether the authenticated user needs
 * to complete or re-complete profile onboarding.
 *
 * Required profile information:
 * - Name
 * - At least one discovery preference
 *
 * Completion is version-aware.
 */
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

    /*
     * If the required information itself is missing,
     * onboarding is required regardless of version.
     */
    if (!hasRequiredInformation) {
        return true;
    }

    /*
     * A profile is considered current only when:
     * 1. backend says it is completed
     * 2. its profile version matches the current version
     */
    const isCurrentProfile =
        user.profileCompleted === true &&
        Number(user.profileVersion) >=
            CURRENT_PROFILE_VERSION;

    return !isCurrentProfile;
};