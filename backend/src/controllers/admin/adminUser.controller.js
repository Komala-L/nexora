import {
    getAdminUsers,
    getAdminUserById,
    getAdminDashboardStats,
    getAdminPlatformActivity,
} from "../../services/admin/adminUser.service.js";

const getAdminUsersController = async (req, res, next) => {
    try {
        const result = await getAdminUsers({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin users fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminUserByIdController = async (req, res, next) => {
    try {
        const user = await getAdminUserById(req.params.userId);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin user profile fetched successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

const getAdminDashboardStatsController = async (req, res, next) => {
    try {
        const stats = await getAdminDashboardStats();

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin dashboard statistics fetched successfully",
            data: { stats },
        });
    } catch (error) {
        next(error);
    }
};


const getAdminPlatformActivityController = async (req, res, next) => {
    try {
        const activity = await getAdminPlatformActivity({
            days: req.query.days,
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Platform activity fetched successfully",
            data: { activity },
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAdminUsersController,
    getAdminUserByIdController,
    getAdminDashboardStatsController,
    getAdminPlatformActivityController,
};
