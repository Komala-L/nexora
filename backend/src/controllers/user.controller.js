import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
    getCurrentUser, 
    updateProfile, 
    updateProfileImage, 
    removeProfileImage, 
    updateLocation, 
    getNearbyUsers
} from "../services/user.service.js";

/**
 * Get the authenticated user's profile.
 */
export const currentUser = asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "Current user fetched successfully"
        )
    );
});

/**
 * Update the authenticated user's profile.
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await updateProfile(
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "User profile updated successfully"
        )
    );
});

/**
 * Update the authenticated user's profile image.
 */
export const updateUserProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Profile image is required."
            )
        );
    }

    const user = await updateProfileImage(
        req.user._id,
        req.file.buffer
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "Profile image updated successfully."
        )
    );
});

/**
 * Remove the authenticated user's profile image.
 */
export const removeUserProfileImage = asyncHandler(async (req, res) => {
    const user = await removeProfileImage(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
            },
            "Profile image removed successfully"
        )
    );
});

/**
 * Update the authenticated user's location.
 */
export const updateUserLocation = asyncHandler(async (req, res) => {
    const { longitude, latitude } = req.body;

    const user = await updateLocation(
        req.user._id,
        [longitude, latitude]
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    id: user._id,
                    name: user.name,
                    gender: user.gender,
                },
            },
            "Location updated successfully"
        )
    );
});

/**
 * Get users near the authenticated user's discovery location.
 */
export const nearbyUsers = asyncHandler(async (req, res) => {
    const users = await getNearbyUsers(
        req.user._id,
        req.validatedQuery.limit
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
            },
            "Nearby users fetched successfully"
        )
    );
});