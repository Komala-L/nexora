import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import cookieOptions from "../utils/cookieOptions.js"
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshTokens } from "../services/auth.service.js"

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Account already exists");
    }

    const user = new User({name, email, password});
    await user.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            "Account created successfully"
        )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await existingUser.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(existingUser._id);

    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
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

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decodedToken._id).select("+refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is invalid or expired");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

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
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(401, "Invalid or expired refresh token");
    }
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        }
    );

    return res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Logout successful"
            )
        );
})