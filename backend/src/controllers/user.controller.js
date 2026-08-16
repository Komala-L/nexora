import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentUser, updateProfile, updateProfileImage, removeProfileImage, } from "../services/user.service.js";

/**
 * Get the authenticated user's profile.
 */
export const currentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: req.user,
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