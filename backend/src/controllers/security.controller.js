import { changePassword } from "../services/security.service.js";

export const changeUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        await changePassword(
            req.user._id,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};