import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
    getPendingModerationNotices,
    acknowledgeModerationNotice,
} from "../services/moderationNotification.service.js";

export const getMyModerationNotices = asyncHandler(async (req, res) => {
    const notices = await getPendingModerationNotices(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            notices,
            "Moderation notices fetched successfully"
        )
    );
});

export const acknowledgeMyModerationNotice = asyncHandler(async (req, res) => {
    const { noticeId } = req.params;

    const result = await acknowledgeModerationNotice(
        req.user._id,
        noticeId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Moderation notice acknowledged successfully"
        )
    );
});