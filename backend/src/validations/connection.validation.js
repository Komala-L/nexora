import { z } from "zod";

const objectIdSchema = z
    .string()
    .trim()
    .min(1, "ID is required")
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId");

export const connectionUserIdSchema = z.object({
    userId: objectIdSchema,
});

export const connectionIdSchema = z.object({
    connectionId: objectIdSchema,
});

export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be a positive integer")
        .default(1),

    limit: z.coerce
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(50, "Limit cannot exceed 50")
        .default(20),
});