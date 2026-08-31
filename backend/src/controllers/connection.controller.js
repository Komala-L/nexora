import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getUserConnections,
  getReceivedConnectionRequests,
  getSentConnectionRequests,
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

/**
 * Accept a pending connection request.
 */
export const acceptConnection = asyncHandler(
    async (req, res) => {
        const connection =
            await acceptConnectionRequest(
                req.params.connectionId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    connection,
                },
                "Connection request accepted successfully"
            )
        );
    }
);

/**
 * Reject a pending connection request.
 */
export const rejectConnection = asyncHandler(
    async (req, res) => {
        const result =
            await rejectConnectionRequest(
                req.params.connectionId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    connectionId: result.connectionId,
                },
                "Connection request rejected successfully"
            )
        );
    }
);

/**
 * Cancel an outgoing pending connection request.
 */
export const cancelConnection = asyncHandler(
    async (req, res) => {
        const result =
            await cancelConnectionRequest(
                req.params.connectionId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    connectionId: result.connectionId,
                },
                "Connection request cancelled successfully"
            )
        );
    }
);

/**
 * Remove an existing connection.
 */
export const removeConnectionController = asyncHandler(
    async (req, res) => {
        const result = await removeConnection(
            req.params.connectionId,
            req.user._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    connectionId: result.connectionId,
                },
                "Connection removed successfully"
            )
        );
    }
);

/**
 * Get the authenticated user's accepted connections.
 */
export const getMyConnections = asyncHandler(
    async (req, res) => {
        const result = await getUserConnections(
            req.user._id,
            req.validatedQuery
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Connections fetched successfully"
            )
        );
    }
);

/**
 * Get pending connection requests received by the authenticated user.
 */
export const getReceivedRequests = asyncHandler(
    async (req, res) => {
        const result =
            await getReceivedConnectionRequests(
                req.user._id,
                req.validatedQuery
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Received connection requests fetched successfully"
            )
        );
    }
);

/**
 * Get pending connection requests sent by the authenticated user.
 */
export const getSentRequests = asyncHandler(
    async (req, res) => {
        const result = await getSentConnectionRequests(
            req.user._id,
            req.validatedQuery
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Sent connection requests fetched successfully"
            )
        );
    }
);