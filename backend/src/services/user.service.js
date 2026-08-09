import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

/**
 * Get the authenticated user's profile.
 */
export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

/**
 * Update the authenticated user's profile.
 */
export const updateProfile = async (userId, updateData) => {
    const allowedFields = [
        "name",
        "bio",
        "interests",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

/**
 * Update the authenticated user's profile image.
 */
export const updateProfileImage = async (userId, imageData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                profilePic: {
                    url: imageData.url,
                    fileId: imageData.fileId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

/**
 * Remove the authenticated user's profile image.
 */
export const removeProfileImage = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                profilePic: {
                    url: null,
                    fileId: null,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

/**
 * Update the authenticated user's location.
 */
export const updateLocation = async (userId, coordinates) => {
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                location: {
                    type: "Point",
                    coordinates,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

/**
 * Search for users by name.
 */
export const searchUsers = async (searchQuery, userId) => {
    const users = await User.find({
        _id: { $ne: userId },
        name: {
            $regex: searchQuery,
            $options: "i",
        },
    })
        .select("name profilePic bio interests")
        .limit(20);

    return users;
};