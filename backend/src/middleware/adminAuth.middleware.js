import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Authenticate an admin using the admin access token stored in an HTTP-only cookie.
 */
export const adminAuthMiddleware = asyncHandler(
    async (req, res, next) => {
        const token =
            req.cookies?.adminAccessToken;

        if (!token) {
            throw new ApiError(
                401,
                "Admin access token not found."
            );
        }

        let decodedToken;

        try {
            decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            throw new ApiError(
                401,
                "Invalid or expired admin access token."
            );
        }

        const admin =
            await Admin.findById(
                decodedToken._id
            );

        if (!admin) {
            throw new ApiError(
                401,
                "Admin account not found."
            );
        }

        if (!admin.isActive) {
            throw new ApiError(
                403,
                "Admin account is inactive."
            );
        }

        req.admin = admin;

        next();
    }
);