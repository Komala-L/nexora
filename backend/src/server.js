import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDatabase from "./config/database.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";

let server;
const startServer = async () => {
    try {
        await connectDatabase();

        const PORT = process.env.PORT || 5000;

        server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });

    } catch (error) {
        logger.error("Server startup failed", {
            message: error.message,
            stack: error.stack
        });
        
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    try {
        logger.info(`${signal} received. Shutting down gracefully...`);

        if (server) {
            server.close();
            logger.info("HTTP server closed");
        }

        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);

    } catch (error) {
        logger.error("Error during shutdown", {
            message: error.message,
            stack: error.stack
        });

        process.exit(1);
    }
};

// Graceful shutdown handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();