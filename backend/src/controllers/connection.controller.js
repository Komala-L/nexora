import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  sendConnectionRequest,
} from "../services/connection.service.js";

/**
 * Send a connection request to another user.
 */
export const createConnectionRequest = asyncHandler(async (req, res) => {
  const result = await sendConnectionRequest(
    req.user._id,
    req.params.userId
  );

  const isAutomaticallyAccepted =
    result.action === "connection_accepted";

  const statusCode = isAutomaticallyAccepted ? 200 : 201;

  const message = isAutomaticallyAccepted
    ? "Connection request accepted automatically"
    : "Connection request sent successfully";

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        connection: result.connection,
      },
      message
    )
  );
});