import { z } from "zod";
import { objectIdSchema } from "./common.validation.js";

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

export const getConnectionsQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),
});