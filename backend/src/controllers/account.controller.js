import asyncHandler from "../utils/asyncHandler.js";
import {
    deleteAccount,
} from "../services/settings.service.js";

export const deleteAccountController = asyncHandler(
    async (req, res) => {
        const { currentPassword } = req.body;

        const result = await deleteAccount(
            req.user._id,
            currentPassword
        );

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    }
);