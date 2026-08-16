import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentUser, updateProfile } from "../services/user.service.js";

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