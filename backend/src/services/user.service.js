import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import logger from "../utils/logger.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";
import { generateProtectedLocation } from "../utils/location.utils.js";

/**
 * Get the authenticated user's profile.
 */
export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select(
        "-password -refreshToken -location -discoveryLocation"
    );

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
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const fileId = user.profilePic?.fileId;

    if (!fileId) {
        throw new ApiError(404, "Profile image not found.");
    }

    user.profilePic = {
        url: null,
        fileId: null,
    };

    await user.save();

    try {
        await deleteImage(fileId);
    } catch (error) {
        logger.error("Failed to delete profile image from Cloudinary", {
            userId,
            fileId,
            message: error.message,
            stack: error.stack,
        });
    }

    return User.findById(userId)
        .select("-password -refreshToken");
};

/**
 * Update the authenticated user's location.
 *
 * The actual location is stored privately.
 * Female users receive a randomized discovery location
 * to protect their exact location.
 */
export const updateLocation = async (userId, coordinates) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const [longitude, latitude] = coordinates;

    let discoveryCoordinates = coordinates;

    if (user.gender === "female") {
        discoveryCoordinates = generateProtectedLocation(
            longitude,
            latitude
        );
    }

    user.location = {
        type: "Point",
        coordinates,
    };

    user.discoveryLocation = {
        type: "Point",
        coordinates: discoveryCoordinates,
    };

    await user.save();

    return User.findById(userId)
        .select("-password -refreshToken");
};