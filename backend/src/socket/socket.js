import { Server } from "socket.io";
import { authenticateSocket } from "./socket.middleware.js";
import logger from "../utils/logger.js";
import User from "../models/user.model.js";

import {
    addOnlineUser,
    removeOnlineUser,
    isUserOnline,
    getOnlineUserIds,
} from "./presence.js";

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
         * SEND CURRENT PRESENCE SNAPSHOT
         *
         * This is important.
         *
         * A client should not have to depend only on
         * catching a "user-online" event.
         * It can ask for the current online state whenever
         * its socket connects.
         * --------------------------------------------------
         */
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
         * SOCKET DISCONNECT
         * --------------------------------------------------
         */
        socket.on("disconnect", async (reason) => {
            const becameOffline = removeOnlineUser(
                userId,
                socket.id
            );

            /*
             * If another browser/tab/device is still
             * connected for the same user, do NOT mark
             * that user offline.
             */
            if (becameOffline) {
                const offlineAt = new Date();

                await User.findByIdAndUpdate(userId, {
                    lastSeenAt: offlineAt,
                });

                /*
                 * The user could reconnect while the
                 * database update was running.
                 *
                 * Check presence again before notifying
                 * everyone that the user is offline.
                 */
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