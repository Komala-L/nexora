import { Server } from "socket.io";
import { authenticateSocket } from "./socket.middleware.js";
import logger from "../utils/logger.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Notification from "../models/notification.model.js";
import {
    addOnlineUser,
    removeOnlineUser,
    isUserOnline,
    getOnlineUserIds,
} from "./presence.js";

import {
    markMessageDelivered,
    markMessageRead,
} from "../services/messageReceipt.service.js";

import {
    markNotificationAsRead,
} from "../services/notification.service.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();

        logger.info(
            `Socket connected: ${socket.id} - User: ${socket.user.name}`
        );

        /*
         * --------------------------------------------------
         * JOIN USER ROOM
         * --------------------------------------------------
         */
        socket.join(`user:${userId}`);

        /*
         * --------------------------------------------------
         * ADD USER SOCKET TO PRESENCE
         * --------------------------------------------------
         */
        addOnlineUser(userId, socket.id);

        /*
        * --------------------------------------------------
        * TYPING START
        * --------------------------------------------------
        */
        socket.on(
            "typing-start",
            async ({ conversationId }) => {
                try {
                    if (!conversationId) {
                        return;
                    }

                    const conversation =
                        await Conversation.findById(
                            conversationId
                        ).select("participants");

                    if (!conversation) {
                        return;
                    }

                    const isParticipant =
                        conversation.participants.some(
                            (participant) =>
                                participant.toString() ===
                                userId
                        );

                    if (!isParticipant) {
                        logger.warn(
                            `Unauthorized typing-start attempt by user ${userId}`
                        );

                        return;
                    }

                    const recipientId =
                        conversation.participants.find(
                            (participant) =>
                                participant.toString() !==
                                userId
                        );

                    if (!recipientId) {
                        return;
                    }

                    socket
                        .to(`user:${recipientId}`)
                        .emit("user-typing", {
                            userId,
                            conversationId,
                            isTyping: true,
                        });
                } catch (error) {
                    logger.error(
                        "Typing start event failed",
                        {
                            message: error.message,
                            stack: error.stack,
                            userId,
                        }
                    );
                }
            }
        );


        /*
        * --------------------------------------------------
        * TYPING STOP
        * --------------------------------------------------
        */
        socket.on(
            "typing-stop",
            async ({ conversationId }) => {
                try {
                    if (!conversationId) {
                        return;
                    }

                    const conversation =
                        await Conversation.findById(
                            conversationId
                        ).select("participants");

                    if (!conversation) {
                        return;
                    }

                    const isParticipant =
                        conversation.participants.some(
                            (participant) =>
                                participant.toString() ===
                                userId
                        );

                    if (!isParticipant) {
                        logger.warn(
                            `Unauthorized typing-stop attempt by user ${userId}`
                        );

                        return;
                    }

                    const recipientId =
                        conversation.participants.find(
                            (participant) =>
                                participant.toString() !==
                                userId
                        );

                    if (!recipientId) {
                        return;
                    }

                    socket
                        .to(`user:${recipientId}`)
                        .emit("user-typing", {
                            userId,
                            conversationId,
                            isTyping: false,
                        });
                } catch (error) {
                    logger.error(
                        "Typing stop event failed",
                        {
                            message: error.message,
                            stack: error.stack,
                            userId,
                        }
                    );
                }
            }
        );


        socket.emit("presence-state", {
            onlineUserIds: getOnlineUserIds(),
        });

        /*
         * --------------------------------------------------
         * INFORM OTHER CONNECTED CLIENTS
         * --------------------------------------------------
         */
        socket.broadcast.emit("user-online", {
            userId,
        });

        /*
        * --------------------------------------------------
        * MESSAGE DELIVERED
        * --------------------------------------------------
        */
        socket.on(
            "message-delivered",
            async ({ messageId }) => {
                try {
                    if (!messageId) {
                        return;
                    }

                    const message =
                        await markMessageDelivered(
                            messageId,
                            userId
                        );

                    /*
                    * Notify the original sender that
                    * their message has been delivered.
                    */
                    io.to(
                        `user:${message.sender.toString()}`
                    ).emit(
                        "message-delivered",
                        {
                            messageId:
                                message._id.toString(),
                            conversationId:
                                message.conversation.toString(),
                        }
                    );
                } catch (error) {
                    logger.error(
                        "Failed to mark message as delivered",
                        {
                            messageId,
                            userId,
                            message: error.message,
                        }
                    );
                }
            }
        );

        /*
        * --------------------------------------------------
        * MESSAGE READ
        * --------------------------------------------------
        */
        socket.on(
            "message-read",
            async ({ messageId }) => {
                try {
                    if (!messageId) {
                        return;
                    }

                    const message =
                        await markMessageRead(
                            messageId,
                            userId
                        );

                    /*
                    * Mark the related message notification
                    * as read for the current user.
                    */
                    const notification =
                        await Notification.findOne({
                            recipient: userId,
                            message: message._id,
                            read: false,
                        });

                    if (notification) {
                        await markNotificationAsRead(
                            notification._id,
                            userId
                        );

                        /*
                        * Tell the current user's UI that
                        * the notification count changed.
                        */
                        io.to(
                            `user:${userId}`
                        ).emit(
                            "notification-read",
                            {
                                notificationId:
                                    notification._id.toString(),

                                type: notification.type,

                                conversationId:
                                    message.conversation.toString(),

                                messageId:
                                    message._id.toString(),
                            }
                        );
                    }

                    /*
                    * Tell the original sender that the
                    * message has been read.
                    */
                    io.to(
                        `user:${message.sender.toString()}`
                    ).emit(
                        "message-read",
                        {
                            messageId:
                                message._id.toString(),

                            conversationId:
                                message.conversation.toString(),

                            readAt:
                                message.readAt,
                        }
                    );
                      io.to(
                        `user:${userId}`
                    ).emit(
                        "notification-read",
                        {
                            messageId:
                                message._id.toString(),
                        }
                    );
                } catch (error) {
                    logger.error(
                        "Failed to mark message as read",
                        {
                            messageId,
                            userId,
                            message: error.message,
                        }
                    );
                }
            }
        );

        /*
         * --------------------------------------------------
         * SOCKET DISCONNECT
         * --------------------------------------------------
         */
        socket.on("disconnect", async (reason) => {
            const becameOffline = removeOnlineUser(
                userId,
                socket.id
            );

            if (becameOffline) {
                const offlineAt = new Date();

                await User.findByIdAndUpdate(userId, {
                    lastSeenAt: offlineAt,
                });
        
                if (!isUserOnline(userId)) {
                    socket.broadcast.emit("user-offline", {
                        userId,
                        lastSeenAt: offlineAt,
                    });
                }
            }

            logger.info(
                `Socket disconnected: ${socket.id} - ${reason}`
            );
        });
    });

    logger.info(
        "Socket.IO initialized successfully"
    );

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};