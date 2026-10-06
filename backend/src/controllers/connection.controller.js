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
  getReceivedConnectionRequestCount,
} from "../services/connection.service.js";

import { getIO } from "../socket/socket.js";

/**
 * Send a connection request to another user.
 */
export const createConnectionRequest = asyncHandler(
  async (req, res) => {
    const requesterId = req.user._id;
    const recipientId = req.params.userId;

    const result = await sendConnectionRequest(
      requesterId,
      recipientId
    );

    const io = getIO();

    /*
     * --------------------------------------------------
     * REQUEST SENT
     * --------------------------------------------------
     */
    if (result.action === "request_sent") {
      io.to(`user:${recipientId}`).emit(
        "connection-request-received",
        {
          connectionId:
            result.connection._id.toString(),

          requesterId:
            requesterId.toString(),

          recipientId:
            recipientId.toString(),
        }
      );
    }

    /*
     * --------------------------------------------------
     * AUTOMATICALLY ACCEPTED
     * --------------------------------------------------
     */
    if (
      result.action === "connection_accepted"
    ) {
      io.to(`user:${recipientId}`).emit(
        "connection-request-accepted",
        {
          connectionId:
            result.connection._id.toString(),

          acceptedBy:
            requesterId.toString(),

          requesterId:
            result.connection.requester.toString(),

          recipientId:
            result.connection.recipient.toString(),
        }
      );

      io.to(`user:${requesterId}`).emit(
        "connection-request-accepted",
        {
          connectionId:
            result.connection._id.toString(),

          acceptedBy:
            requesterId.toString(),

          requesterId:
            result.connection.requester.toString(),

          recipientId:
            result.connection.recipient.toString(),
        }
      );
    }

    const isAutomaticallyAccepted =
      result.action === "connection_accepted";

    const statusCode =
      isAutomaticallyAccepted ? 200 : 201;

    const message =
      isAutomaticallyAccepted
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
  }
);

/**
 * Accept a pending connection request.
 */
export const acceptConnection = asyncHandler(
  async (req, res) => {
    const userId = req.user._id;

    const connection =
      await acceptConnectionRequest(
        req.params.connectionId,
        userId
      );

    const io = getIO();

    const requesterId =
      connection.requester.toString();

    const recipientId =
      connection.recipient.toString();

    /*
     * The recipient accepted the request.
     * Remove it from the recipient's pending list.
     */
    io.to(`user:${recipientId}`).emit(
      "connection-request-removed",
      {
        connectionId:
          connection._id.toString(),

        reason: "accepted",
      }
    );

    /*
     * Tell the original requester that
     * their request has been accepted.
     */
    io.to(`user:${requesterId}`).emit(
      "connection-request-accepted",
      {
        connectionId:
          connection._id.toString(),

        acceptedBy:
          recipientId,

        requesterId,
        recipientId,
      }
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
    const userId = req.user._id;

    const result =
      await rejectConnectionRequest(
        req.params.connectionId,
        userId
      );

    const io = getIO();

    /*
     * The request was removed from the
     * authenticated user's received requests.
     */
    io.to(`user:${userId}`).emit(
      "connection-request-removed",
      {
        connectionId:
          result.connectionId.toString(),

        reason: "rejected",
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          connectionId:
            result.connectionId,
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
    const userId = req.user._id;

    const result =
      await cancelConnectionRequest(
        req.params.connectionId,
        userId
      );

    const io = getIO();

    /*
     * Remove the request from the sender's
     * Sent requests immediately.
     */
    io.to(`user:${userId}`).emit(
      "connection-request-removed",
      {
        connectionId:
          result.connectionId.toString(),

        reason: "cancelled",
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          connectionId:
            result.connectionId,
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

/**
 * Get the number of pending connection requests
 * received by the authenticated user.
 */
export const getReceivedRequestCount = asyncHandler(
    async (req, res) => {
        const result =
            await getReceivedConnectionRequestCount(
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Received connection request count fetched successfully"
            )
        );
    }
);