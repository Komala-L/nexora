import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import cookieOptions from "../../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin.model.js";

import {
    loginAdmin,
    generateAdminAccessAndRefreshTokens,
} from "../../services/admin/adminAuth.service.js";

/**
 * Admin login.
 */
export const loginAdminController = asyncHandler(
    async (req, res) => {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            throw new ApiError(
                400,
                "Email and password are required."
            );
        }

        const {
            admin,
            accessToken,
            refreshToken,
        } = await loginAdmin(
            email,
            password
        );

        return res
            .cookie(
                "adminAccessToken",
                accessToken,
                cookieOptions
            )
            .cookie(
                "adminRefreshToken",
                refreshToken,
                cookieOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        admin,
                    },
                    "Admin login successful"
                )
            );
    }
);

/**
 * Refresh admin access token.
 */
export const refreshAdminAccessToken =
    asyncHandler(async (req, res) => {
        const incomingRefreshToken =
            req.cookies?.adminRefreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(
                401,
                "Admin refresh token not found"
            );
        }

        try {
            const decodedToken =
                jwt.verify(
                    incomingRefreshToken,
                    process.env
                        .JWT_REFRESH_SECRET
                );

            const admin =
                await Admin.findById(
                    decodedToken._id
                ).select(
                    "+refreshToken"
                );

            if (!admin) {
                throw new ApiError(
                    401,
                    "Invalid admin refresh token"
                );
            }

            if (!admin.isActive) {
                throw new ApiError(
                    403,
                    "Admin account is inactive."
                );
            }

            if (
                admin.refreshToken !==
                incomingRefreshToken
            ) {
                throw new ApiError(
                    401,
                    "Admin refresh token is invalid or expired"
                );
            }

            const {
                accessToken,
                refreshToken,
            } =
                await generateAdminAccessAndRefreshTokens(
                    admin._id
                );

            return res
                .cookie(
                    "adminAccessToken",
                    accessToken,
                    cookieOptions
                )
                .cookie(
                    "adminRefreshToken",
                    refreshToken,
                    cookieOptions
                )
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Admin access token refreshed successfully"
                    )
                );
        } catch (error) {
            if (
                error instanceof ApiError
            ) {
                throw error;
            }

            throw new ApiError(
                401,
                "Invalid or expired admin refresh token"
            );
        }
    });

/**
 * Admin logout.
 */
export const logoutAdmin =
    asyncHandler(async (req, res) => {
        await Admin.findByIdAndUpdate(
            req.admin._id,
            {
                $unset: {
                    refreshToken: 1,
                },
            }
        );

        return res
            .clearCookie(
                "adminAccessToken",
                cookieOptions
            )
            .clearCookie(
                "adminRefreshToken",
                cookieOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Admin logout successful"
                )
            );
    });

export const getCurrentAdmin = asyncHandler(
    async (req, res) => {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    admin: {
                        id: req.admin._id,
                        name: req.admin.name,
                        email: req.admin.email,
                        role: req.admin.role,
                        isActive: req.admin.isActive,
                        lastLoginAt: req.admin.lastLoginAt,
                    },
                },
                "Admin details fetched successfully"
            )
        );
    }
);