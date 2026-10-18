import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import cookieOptions from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js";
import AdminSettings from "../models/adminSettings.model.js";

export const registerUser = asyncHandler(async (req, res) => {
    const {
        name,
        gender,
        email,
        password,
    } = req.body;

    const adminSettings = await AdminSettings.findOne({
        key: "global",
    });

    if (adminSettings?.allowRegistration === false) {
        throw new ApiError(
            403,
            "New user registrations are currently disabled."
        );
    }

    const existingUser = await User.findOne({
        email,
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "Account already exists"
        );
    }

    const user = new User({
        name,
        gender,
        email,
        password,
        profileCompleted: false,
        profileVersion: 0,
    });

    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    user: {
                        id: user._id,
                        name: user.name,
                        gender: user.gender,
                        email: user.email,
                        profileCompleted: user.profileCompleted,
                    },
                },
                "Account created and logged in successfully"
            )
        );
});

export const loginUser = asyncHandler(async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    const existingUser =
        await User.findOne({ email })
            .select("+password");

    if (!existingUser) {
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const isPasswordValid =
        await existingUser.comparePassword(
            password
        );

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const {
        accessToken,
        refreshToken,
    } =
        await generateAccessAndRefreshTokens(
            existingUser._id
        );

    return res
        .cookie(
            "accessToken",
            accessToken,
            cookieOptions
        )
        .cookie(
            "refreshToken",
            refreshToken,
            cookieOptions
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        id: existingUser._id,
                        name: existingUser.name,
                        email: existingUser.email,
                    },
                },
                "Login successful"
            )
        );
});

export const refreshAccessToken =
    asyncHandler(async (req, res) => {
        const incomingRefreshToken =
            req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(
                401,
                "Refresh token not found"
            );
        }
        
        let decodedToken;

        try {
            decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.JWT_REFRESH_SECRET
            );
        } catch {
            throw new ApiError(
                401,
                "Invalid or expired refresh token"
            );
        }

        const user = await User.findById(decodedToken._id)
            .select("+refreshToken");

        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(
                401,
                "Refresh token is invalid or expired"
            );
        }

        const {
            accessToken,
            refreshToken,
        } = await generateAccessAndRefreshTokens(user._id);

        return res
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Access token refreshed successfully"
                )
            );

    });

export const logoutUser =
    asyncHandler(async (req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1,
                },
            }
        );

        return res
            .clearCookie(
                "accessToken",
                cookieOptions
            )
            .clearCookie(
                "refreshToken",
                cookieOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Logout successful"
                )
            );
    });