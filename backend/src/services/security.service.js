import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const changePassword = async (
    userId,
    currentPassword,
    newPassword
) => {
    const user = await User.findById(userId).select(
        "+password"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect =
        await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Current password is incorrect"
        );
    }

    const isSamePassword =
        await user.comparePassword(newPassword);

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from your current password"
        );
    }

    user.password = newPassword;

    await user.save();

    return {
        message: "Password changed successfully",
    };
};