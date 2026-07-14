import logger from "../utils/logger.js";

const errorMiddleware = (error, req, res, next) => {
    logger.error(error.message, {
        stack: error.stack,
        path: req.path,
        method: req.method
    });

    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error"
    })
}

export default errorMiddleware;