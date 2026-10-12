import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Admin name is required"],
            minlength: 3,
            maxlength: 40,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Admin email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please provide a valid admin email address",
            ],
        },

        password: {
            type: String,
            required: [true, "Admin password is required"],
            minlength: 8,
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            ],
            select: false,
        },

        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        Number(process.env.BCRYPT_SALT_ROUNDS)
    );
});

adminSchema.methods.comparePassword = async function (
    password
) {
    return bcrypt.compare(
        password,
        this.password
    );
};


adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );
};


adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:
                process.env.JWT_REFRESH_TOKEN_EXPIRY,
        }
    );
};

const Admin = mongoose.model(
    "Admin",
    adminSchema
);

export default Admin;