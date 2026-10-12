import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../src/models/admin.model.js";

dotenv.config();

const createAdmin = async () => {
    try {
        const {
            MONGODB_URI,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
        } = process.env;

        if (
            !MONGODB_URI ||
            !ADMIN_EMAIL ||
            !ADMIN_PASSWORD
        ) {
            throw new Error(
                "MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD are required."
            );
        }

        await mongoose.connect(MONGODB_URI);

        console.log(
            "MongoDB connection established."
        );

        const existingAdmin =
            await Admin.findOne({
                email: ADMIN_EMAIL,
            });

        if (existingAdmin) {
            console.log(
                `Admin already exists: ${ADMIN_EMAIL}`
            );

            await mongoose.disconnect();

            return;
        }

        const admin = await Admin.create({
            name: "Nexora Admin",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "superadmin",
            isActive: true,
        });

        console.log(
            "\nAdmin created successfully."
        );

        console.log({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
        });

        await mongoose.disconnect();

        console.log(
            "\nMongoDB connection closed."
        );
    } catch (error) {
        console.error(
            "\nFailed to create admin:"
        );

        console.error(error.message);

        await mongoose.disconnect();

        process.exit(1);
    }
};

createAdmin();