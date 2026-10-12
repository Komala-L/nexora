import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const getPendingModerationNotices = async (userId) => {
    const user = await User.findById(userId)
        .select("moderationHistory");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user.moderationHistory
        .filter((entry) =>
            ["warning", "final_warning", "temporary_suspension", "permanent_ban"]
                .includes(entry.action) &&
            !entry.acknowledgedAt
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((entry) => ({
            id: entry._id,
            action: entry.action,
            reason: entry.reason,
            createdAt: entry.createdAt,
            expiresAt: entry.expiresAt,
            acknowledgedAt: entry.acknowledgedAt,
            title:
                entry.action === "final_warning"
                    ? "Final Warning"
                    : entry.action === "temporary_suspension"
                    ? "Account Temporarily Suspended"
                    : entry.action === "permanent_ban"
                        ? "Account Permanently Banned"
                        : "Official Warning",
        }));
};

export const acknowledgeModerationNotice = async (userId, noticeId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const notice = user.moderationHistory.id(noticeId);

    if (
        !notice ||
        !["warning", "final_warning", "temporary_suspension", "permanent_ban"]
            .includes(notice.action)
    ) {
        throw new ApiError(404, "Moderation notice not found");
    }

    if (!notice.acknowledgedAt) {
        notice.acknowledgedAt = new Date();
        await user.save();
    }

    return {
        id: notice._id,
        acknowledgedAt: notice.acknowledgedAt,
    };
};