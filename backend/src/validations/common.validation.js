import { z } from "zod";

export const objectIdSchema = z
    .string()
    .trim()
    .min(1, "ID is required")
    .regex(
        /^[a-fA-F0-9]{24}$/,
        "Invalid MongoDB ObjectId"
    );