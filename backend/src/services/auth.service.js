import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.accountStatus === "banned") {
            user.refreshToken = undefined;
            await user.save({ validateBeforeSave: false });

            throw new ApiError(
                403,
                "Your account has been permanently banned."
            );
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
                user.refreshToken = undefined;

                await user.save({ validateBeforeSave: false });

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
            user.refreshToken = undefined;

            user.moderationHistory.push({
                action: "suspension_expired",
                reason: "The temporary suspension period has ended.",
                createdAt: now,
            });

            await user.save({ validateBeforeSave: false });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false,
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens."
        );
    }
};