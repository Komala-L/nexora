import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
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
    } 
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens."
        );
    }
};