import AdminSettings from "../models/adminSettings.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const MAINTENANCE_EXEMPT_PATHS = new Set([
    "/api/v1/auth/login",
    "/api/v1/auth/logout",
    "/api/v1/auth/refresh-token",
    "/api/v1/admin/auth/refresh",
]);

export const maintenanceMiddleware = asyncHandler(
    async (req, res, next) => {
        if (req.method === "OPTIONS") {
            return next();
        }

        if (req.originalUrl.startsWith("/api/v1/admin/")) {
            return next();
        }

        const requestPath = req.originalUrl.split("?")[0];

        if (MAINTENANCE_EXEMPT_PATHS.has(requestPath)) {
            return next();
        }

        const settings = await AdminSettings.findOne({
            key: "global",
        }).select("maintenanceMode");

        if (settings?.maintenanceMode === true) {
            throw new ApiError(
                503,
                "Nexora is temporarily unavailable for maintenance. Please try again later."
            );
        }

        return next();
    }
);