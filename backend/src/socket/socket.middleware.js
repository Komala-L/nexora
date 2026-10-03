import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateSocket = async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie;

        if (!cookies) {
            return next(
                new Error("Unauthorized socket connection")
            );
        }

        const accessToken = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) =>
                cookie.startsWith("accessToken=")
            )
            ?.split("=")[1];

        if (!accessToken) {
            return next(
                new Error("Unauthorized socket connection")
            );
        }

        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decodedToken._id
        ).select("-password");

        if (!user) {
            return next(
                new Error("Invalid access token")
            );
        }

        socket.user = user;

        next();
    } catch (error) {
        next(
            new Error(
                "Invalid or expired access token"
            )
        );
    }
};