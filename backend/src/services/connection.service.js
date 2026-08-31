import mongoose from "mongoose";

import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const generatePairKey = (userId1, userId2) => {
    const [firstUserId, secondUserId] = [
        userId1.toString(),
        userId2.toString(),
    ].sort();

    return `${firstUserId}:${secondUserId}`;
};


const ensureUserExists = async (userId) => {
    const userExists = await User.exists({
        _id: userId,
    });

    if (!userExists) {
        throw new ApiError(404, "User not found");
    }
};


const normalizePagination = (
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT
) => {
    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);

    return {
        page: normalizedPage,
        limit: normalizedLimit,
        skip: (normalizedPage - 1) * normalizedLimit,
    };
};


const handleDuplicateConnectionError = (error) => {
    if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
    ) {
        throw new ApiError(
            409,
            "A connection relationship already exists between these users"
        );
    }

    throw error;
};


export const sendConnectionRequest = async (
    requesterId,
    recipientId
) => {
    if (
        requesterId.toString() === recipientId.toString()
    ) {
        throw new ApiError(
            400,
            "You cannot send a connection request to yourself"
        );
    }

    await ensureUserExists(recipientId);

    const pairKey = generatePairKey(
        requesterId,
        recipientId
    );

    const existingConnection = await Connection.findOne({
        pairKey,
    });

   
    if (!existingConnection) {
        try {
            const connection = await Connection.create({
                requester: requesterId,
                recipient: recipientId,
                pairKey,
                status: "pending",
            });

            return {
              connection,
              action: "request_sent",
            };
  
        } catch (error) {
            handleDuplicateConnectionError(error);
        }
    }

    
    if (existingConnection.status === "accepted") {
        throw new ApiError(
            409,
            "You are already connected with this user"
        );
    }

    
    if (
        existingConnection.requester.toString() ===
        requesterId.toString()
    ) {
        throw new ApiError(
            409,
            "Connection request already sent"
        );
    }

  
  if (
      existingConnection.recipient.toString() ===
      requesterId.toString()
  ) {
      existingConnection.status = "accepted";

      await existingConnection.save();

      return {
          connection: existingConnection,
          action: "connection_accepted",
      };
  }
}


export const acceptConnectionRequest = async (
    connectionId,
    userId
) => {
    const connection = await Connection.findById(
        connectionId
    );

    if (!connection) {
        throw new ApiError(
            404,
            "Connection request not found"
        );
    }

    if (
        connection.recipient.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to accept this connection request"
        );
    }

    if (connection.status === "accepted") {
        throw new ApiError(
            409,
            "Connection request has already been accepted"
        );
    }

    if (connection.status !== "pending") {
        throw new ApiError(
            409,
            "This connection request cannot be accepted"
        );
    }

    connection.status = "accepted";

    await connection.save();

    return connection;
};

export const rejectConnectionRequest = async (
    connectionId,
    userId
) => {
    const connection = await Connection.findById(
        connectionId
    );

    if (!connection) {
        throw new ApiError(
            404,
            "Connection request not found"
        );
    }

    if (
        connection.recipient.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to reject this connection request"
        );
    }

    if (connection.status !== "pending") {
        throw new ApiError(
            409,
            "This connection request cannot be rejected"
        );
    }

    await connection.deleteOne();

    return {
        connectionId: connection._id,
    };
};


export const cancelConnectionRequest = async (
    connectionId,
    userId
) => {
    const connection = await Connection.findById(
        connectionId
    );

    if (!connection) {
        throw new ApiError(
            404,
            "Connection request not found"
        );
    }

    if (
        connection.requester.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to cancel this connection request"
        );
    }

    if (connection.status !== "pending") {
        throw new ApiError(
            409,
            "Only pending connection requests can be cancelled"
        );
    }

    await connection.deleteOne();

    return {
        connectionId: connection._id,
    };
};


export const getReceivedConnectionRequests = async (
    userId,
    pagination = {}
) => {
    const { page, limit, skip } = normalizePagination(
        pagination.page,
        pagination.limit
    );

    const filter = {
        recipient: userId,
        status: "pending",
    };

    const [requests, total] = await Promise.all([
        Connection.find(filter)
            .populate(
                "requester",
                "_id name profilePic bio interests"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Connection.countDocuments(filter),
    ]);

    return {
        requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const getSentConnectionRequests = async (
    userId,
    pagination = {}
) => {
    const { page, limit, skip } = normalizePagination(
        pagination.page,
        pagination.limit
    );

    const filter = {
        requester: userId,
        status: "pending",
    };

    const [requests, total] = await Promise.all([
        Connection.find(filter)
            .populate(
                "recipient",
                "name profilePic bio interests"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Connection.countDocuments(filter),
    ]);

    return {
        requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const getUserConnections = async (
    userId,
    pagination = {}
) => {
    const { page, limit, skip } = normalizePagination(
        pagination.page,
        pagination.limit
    );

    const filter = {
        status: "accepted",
        $or: [
            { requester: userId },
            { recipient: userId },
        ],
    };

    const [connections, total] = await Promise.all([
        Connection.find(filter)
            .populate(
                "requester recipient",
                "_id name profilePic bio interests"
            )
            .sort({
                updatedAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Connection.countDocuments(filter),
    ]);

    const formattedConnections = connections.map(
        (connection) => {
            const isRequester =
                connection.requester._id.toString() ===
                userId.toString();

            const connectedUser = isRequester
                ? connection.recipient
                : connection.requester;

            return {
                connectionId: connection._id,
                user: connectedUser,
                connectedAt: connection.updatedAt,
            };
        }
    );

    return {
        connections: formattedConnections,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const removeConnection = async (
    connectionId,
    userId
) => {
    const connection = await Connection.findById(
        connectionId
    );

    if (!connection) {
        throw new ApiError(
            404,
            "Connection not found"
        );
    }

    const isRequester =
        connection.requester.toString() ===
        userId.toString();

    const isRecipient =
        connection.recipient.toString() ===
        userId.toString();

    if (!isRequester && !isRecipient) {
        throw new ApiError(
            403,
            "You are not authorized to remove this connection"
        );
    }

    if (connection.status !== "accepted") {
        throw new ApiError(
            409,
            "Only accepted connections can be removed"
        );
    }

    await connection.deleteOne();

    return {
        connectionId: connection._id,
    };
};