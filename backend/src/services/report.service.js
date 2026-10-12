import mongoose from "mongoose";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

const ALLOWED_REASONS = [
  "harassment",
  "spam",
  "fake_profile",
  "inappropriate_content",
  "scam",
  "other",
];

export const createUserReport = async ({
  reporterId,
  reportedUserId,
  reason,
  description = "",
}) => {
  if (!mongoose.isValidObjectId(reportedUserId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  if (reporterId.toString() === reportedUserId.toString()) {
    throw new ApiError(400, "You cannot report your own profile.");
  }

  if (!ALLOWED_REASONS.includes(reason)) {
    throw new ApiError(400, "Please select a valid report reason.");
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Description must be text.");
  }

  const cleanedDescription = description.trim();

  if (cleanedDescription.length > 1000) {
    throw new ApiError(
      400,
      "Description cannot exceed 1000 characters."
    );
  }

  const reportedUser = await User.findById(reportedUserId).select("_id");

  if (!reportedUser) {
    throw new ApiError(404, "The user you want to report was not found.");
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    reason,
    description: cleanedDescription,
    status: "pending",
  });

  return {
    reportId: report._id,
    status: report.status,
  };
};