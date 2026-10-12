import User from "../../models/user.model.js";
import Report from "../../models/report.model.js";

const getAdminUsers = async ({
    page = 1,
    limit = 10,
    search = "",
}) => {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = {};
    const normalizedSearch = String(search).trim();

    if (normalizedSearch) {
        const escapedSearch = normalizedSearch.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
        ];
    }

    const safeProjection = [
        "name",
        "email",
        "gender",
        "profilePic.url",
        "bio",
        "profileCompleted",
        "isDiscoverable",
        "discoveryEnabled",
        "lastSeenAt",
        "createdAt",
        "updatedAt",
    ].join(" ");

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select(safeProjection)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page: currentPage,
            limit: pageSize,
            totalUsers,
            totalPages: Math.ceil(totalUsers / pageSize),
        },
    };
};

const getAdminUserById = async (userId) => {
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
        const error = new Error("Invalid user ID.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId)
        .select(
            [
                "name",
                "email",
                "gender",
                "profilePic.url",
                "bio",
                "profileCompleted",
                "isDiscoverable",
                "discoveryEnabled",
                "lastSeenAt",
                "createdAt",
                "updatedAt",
                "interests",
                "discoveryPreferences",
                "professional",
                "learning",
            ].join(" ")
        )
        .lean();

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const getAdminDashboardStats = async () => {
    const [totalUsers, completedProfiles, discoverableUsers, newRegistrations] =
        await Promise.all([
            User.countDocuments(),
            User.countDocuments({ profileCompleted: true }),
            User.countDocuments({
                profileCompleted: true,
                isDiscoverable: true,
                discoveryEnabled: true,
            }),
            User.countDocuments({
                createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            }),
        ]);

    return {
        totalUsers,
        completedProfiles,
        discoverableUsers,
        newRegistrations,
    };
};

const getAdminPlatformActivity = async ({ days = 7 } = {}) => {
    const periodDays = Number(days) === 30 ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - periodDays);

    const [
        recentlySeenUsers,
        pendingReports,
        registrations,
        recentUsers,
        recentReports,
        moderatedUsers,
    ] = await Promise.all([
        User.countDocuments({
            lastSeenAt: { $gte: startDate, $lte: now },
        }),

        Report.countDocuments({ status: "pending" }),

        User.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        User.find({ createdAt: { $gte: startDate, $lte: now } })
            .select("name createdAt")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Report.find({ createdAt: { $gte: startDate, $lte: now } })
            .select("reason status createdAt")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        User.find({ "moderationHistory.0": { $exists: true } })
            .select("name moderationHistory")
            .lean(),
    ]);

    const activity = [
        ...recentUsers.map((user) => ({
            id: `registration-${user._id}`,
            type: "registration",
            message: `${user.name} registered`,
            createdAt: user.createdAt,
        })),

        ...recentReports.map((report) => ({
            id: `report-${report._id}`,
            type: "report",
            message: `A report was submitted (${report.reason.replaceAll("_", " ")})`,
            status: report.status,
            createdAt: report.createdAt,
        })),

        ...moderatedUsers.flatMap((user) =>
            user.moderationHistory
                .filter(
                    (entry) =>
                        entry.createdAt >= startDate &&
                        entry.createdAt <= now
                )
                .map((entry, index) => ({
                    id: `moderation-${user._id}-${entry._id ?? index}`,
                    type: "moderation",
                    message: `Moderation action: ${entry.action.replaceAll("_", " ")}`,
                    createdAt: entry.createdAt,
                }))
        ),
    ]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 15);

    const registrationChart = Array.from(
        { length: periodDays },
        (_, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0"),
            ].join("-");

            return {
                date: key,
                registrations:
                    registrations.find((item) => item._id === key)?.count ?? 0,
            };
        }
    );

    return {
        periodDays,
        recentlySeenUsers,
        recentlySeenLabel: "Users last seen offline in this period",
        pendingReports,
        registrationChart,
        recentActivity: activity,
    };
};

export { getAdminUsers, getAdminUserById, getAdminDashboardStats, getAdminPlatformActivity };