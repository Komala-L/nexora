import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";

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
export const updateProfileImage = async (userId, imageBuffer) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new ApiError(404, "User not found.");
    }

    const oldFileId = existingUser.profilePic?.fileId;
    const newImage = await uploadImage(imageBuffer);

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    profilePic: {
                        url: newImage.url,
                        fileId: newImage.fileId,
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

    
        if (oldFileId) {
            try {
                await deleteImage(oldFileId);
            } catch (error) {
                logger.error("Failed to delete old Cloudinary profile image", {
                    message: error.message,
                    stack: error.stack,
                });
            }
        }

        return user;

    } catch (error) {
        try {
            await deleteImage(newImage.fileId);
        } catch (cleanupError) {
            logger.error("Failed to clean up newly uploaded Cloudinary image", {
                message: cleanupError.message,
                stack: cleanupError.stack,
            });
        }

        throw error;
    }
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
export const searchUsers = async (searchQuery, userId, page, limit) => {
    const skip = (page - 1) * limit;

    const users = await User.find({
        _id: { $ne: userId },
        name: {
            $regex: searchQuery,
            $options: "i",
        },
    })
        .select("name profilePic bio interests")
        .skip(skip)
        .limit(limit);

    return users;
};