import Admin from "../../models/admin.model.js";
import ApiError from "../../utils/apiError.js";

/**
 * Generate access and refresh tokens for an authenticated admin.
 */
export const generateAdminAccessAndRefreshTokens =
    async (adminId) => {
        try {
            const admin =
                await Admin.findById(adminId).select(
                    "+refreshToken"
                );

            if (!admin) {
                throw new ApiError(
                    404,
                    "Admin not found"
                );
            }

            const accessToken =
                admin.generateAccessToken();

            const refreshToken =
                admin.generateRefreshToken();

            admin.refreshToken = refreshToken;

            await admin.save({
                validateBeforeSave: false,
            });

            return {
                accessToken,
                refreshToken,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                500,
                "Something went wrong while generating admin access and refresh tokens."
            );
        }
    };

/**
 * Authenticate an admin using email and password.
 */
export const loginAdmin = async (
    email,
    password
) => {
    const admin =
        await Admin.findOne({ email })
            .select("+password +refreshToken");

    if (!admin) {
        throw new ApiError(
            401,
            "Invalid admin email or password."
        );
    }

    if (!admin.isActive) {
        throw new ApiError(
            403,
            "Admin account is inactive."
        );
    }

    const isPasswordValid =
        await admin.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Invalid admin email or password."
        );
    }

    const {
        accessToken,
        refreshToken,
    } =
        await generateAdminAccessAndRefreshTokens(
            admin._id
        );

    admin.lastLoginAt = new Date();

    await admin.save({
        validateBeforeSave: false,
    });

    return {
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            lastLoginAt: admin.lastLoginAt,
        },
        accessToken,
        refreshToken,
    };
};