import { createUserReport } from "../services/report.service.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createUserReportController = asyncHandler(
  async (req, res) => {
    const report = await createUserReport({
      reporterId: req.user._id,
      reportedUserId: req.params.userId,
      reason: req.body.reason,
      description: req.body.description ?? "",
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        { report },
        "Report submitted successfully."
      )
    );
  }
);