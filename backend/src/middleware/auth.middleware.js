import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    if (user.accountStatus === "banned") {
        throw new ApiError(403, "Your account has been permanently banned.");
    }

    if (user.accountStatus === "suspended") {
        const now = new Date();

        if (!user.suspensionExpiresAt) {
            throw new ApiError(
                403,
                "Your account is suspended and requires administrator review."
            );
        }

        if (user.suspensionExpiresAt > now) {
            const expiryDate = user.suspensionExpiresAt.toLocaleString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                }
            );

            throw new ApiError(
                403,
                `Your account is temporarily suspended until ${expiryDate} IST.`
            );
        }

        user.accountStatus = "active";
        user.suspensionExpiresAt = null;

        user.moderationHistory.push({
            action: "suspension_expired",
            reason: "The temporary suspension period has ended.",
            createdAt: now,
        });

        await user.save();
    }

    req.user = user;
    next();
});