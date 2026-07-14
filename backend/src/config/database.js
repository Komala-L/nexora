import mongoose from "mongoose"
import logger from "../utils/logger.js";

// MongoDB connection monitoring
mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (error) => {
    logger.error(`MongoDB error: ${error.message}`);
});

mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
});

// Database connection function
const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDatabase;