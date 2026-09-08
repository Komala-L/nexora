import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
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
        "discoveryPreferences",
        "professional",
        "learning",
    ];

    const updates = {};

    // Simple fields
    for (const field of [
        "name",
        "bio",
        "interests",
        "discoveryPreferences",
    ]) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    // Nested professional fields
    if (updateData.professional !== undefined) {
        for (const field of [
            "role",
            "company",
            "skills",
            "industry",
        ]) {
            if (updateData.professional[field] !== undefined) {
                updates[`professional.${field}`] =
                    updateData.professional[field];
            }
        }
    }

    // Nested learning fields
    if (updateData.learning !== undefined) {
        for (const field of [
            "subjects",
            "learningGoal",
        ]) {
            if (updateData.learning[field] !== undefined) {
                updates[`learning.${field}`] =
                    updateData.learning[field];
            }
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

/**
 * Get users near the authenticated user's discovery location.
 */
export const getNearbyUsers = async (userId, limit = 10) => {
    const currentUser = await User.findById(userId)
        .select("discoveryLocation");

    if (!currentUser) {
        throw new ApiError(404, "User not found.");
    }

    if (
        !currentUser.discoveryLocation ||
        !Array.isArray(currentUser.discoveryLocation.coordinates) ||
        currentUser.discoveryLocation.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Please update your location before searching for nearby users."
        );
    }

    const MAX_DISCOVERY_RADIUS_METERS = 10 * 1000;

    const nearbyUsers = await User.find({
        _id: { $ne: userId },

        discoveryLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: currentUser.discoveryLocation.coordinates,
                },
                $maxDistance: MAX_DISCOVERY_RADIUS_METERS,
            },
        },
    })
        .select("name gender profilePic bio interests")
        .limit(limit);

    return nearbyUsers;
};

const addConnectionStatus = async (userId, users) => {
    if (!users.length) {
        return [];
    }

    const userIds = users.map((user) => user._id);

    const connections = await Connection.find({
        $or: [
            {
                requester: userId,
                recipient: { $in: userIds },
            },
            {
                recipient: userId,
                requester: { $in: userIds },
            },
        ],
    })
        .select("requester recipient status")
        .lean();

    const connectionMap = new Map();

    for (const connection of connections) {
        const otherUserId =
            connection.requester.toString() === userId.toString()
                ? connection.recipient.toString()
                : connection.requester.toString();

        let connectionStatus;

        if (connection.status === "accepted") {
            connectionStatus = "accepted";
        } else if (
            connection.requester.toString() === userId.toString()
        ) {
            connectionStatus = "pending_sent";
        } else {
            connectionStatus = "pending_received";
        }

        connectionMap.set(
            otherUserId,
            connectionStatus
        );
    }

    return users.map((user) => ({
        ...user,
        connectionStatus:
            connectionMap.get(user._id.toString()) || "none",
    }));
};

/**
 * Discover users based on discovery category.
 */
export const discoverUsers = async (
    userId,
    type,
    limit = 10,
    radius = 10
) => {
    const currentUser = await User.findById(userId)
        .select(
            "discoveryLocation interests discoveryPreferences"
        );

    if (!currentUser) {
        throw new ApiError(404, "User not found.");
    }

    if (
        !currentUser.discoveryLocation ||
        !Array.isArray(
            currentUser.discoveryLocation.coordinates
        ) ||
        currentUser.discoveryLocation.coordinates.length !== 2
    ) {
        throw new ApiError(
            400,
            "Please update your location before discovering users."
        );
    }

    const MAX_DISCOVERY_RADIUS_METERS = radius * 1000;

    const baseFilter = {
        _id: { $ne: userId },
    };

    const locationFilter = {
        discoveryLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates:
                        currentUser.discoveryLocation.coordinates,
                },
                $maxDistance:
                    MAX_DISCOVERY_RADIUS_METERS,
            },
        },
    };

    let categoryFilter = {};

    switch (type) {
        case "nearby":
            break;

        case "friends":
            categoryFilter = {
                discoveryPreferences: "friends",
            };
            break;

        case "professional":
            categoryFilter = {
                discoveryPreferences: "professional",
            };
            break;

        case "learning":
            categoryFilter = {
                discoveryPreferences: "learning",
            };
            break;

        case "interests":
            if (
                !Array.isArray(currentUser.interests) ||
                currentUser.interests.length === 0
            ) {
                return [];
            }

            categoryFilter = {
                interests: {
                    $in: currentUser.interests,
                },
            };
            break;

        default:
            throw new ApiError(
                400,
                "Invalid discovery type."
            );
    }

    const users = await User.find({
        ...baseFilter,
        ...locationFilter,
        ...categoryFilter,
    })
        .select(
            "name gender profilePic bio interests discoveryPreferences professional learning"
        )
        .limit(limit)
        .lean();

return addConnectionStatus(userId, users);
};

/**
 * Get a user's public profile.
 */
export const getUserById = async (userId) => {
    const user = await User.findById(userId).select(
        "_id name gender profilePic bio interests"
    );

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};