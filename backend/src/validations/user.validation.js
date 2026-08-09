import { z } from "zod";

const nameSchema = z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long.")
    .max(40, "Name cannot exceed 40 characters.");

const bioSchema = z
    .string()
    .trim()
    .max(150, "Bio cannot exceed 150 characters.");

const interestsSchema = z
    .array(
        z
            .string()
            .trim()
            .min(1, "Interest cannot be empty.")
    )
    .max(12, "A user can have a maximum of 12 interests.");


/* 1. Update Profile */

export const updateProfileSchema = z.object({
    name: nameSchema.optional(),
    bio: bioSchema.optional(),
    interests: interestsSchema.optional(),
})
.strict()
.refine(
    (data) =>
        data.name !== undefined ||
        data.bio !== undefined ||
        data.interests !== undefined,
    {
        message: "At least one profile field must be provided.",
    }
);


/* 2. Update Profile Image */

export const updateProfileImageSchema = z.object({}).strict();


/* 3. Update Location */

export const updateLocationSchema = z.object({
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180.")
        .max(180, "Longitude must be between -180 and 180."),

    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90.")
        .max(90, "Latitude must be between -90 and 90."),
})
.strict();


/* 4. User Search */

export const searchUserSchema = z.object({
    query: z
        .string()
        .trim()
        .min(1, "Search query cannot be empty.")
        .max(40, "Search query cannot exceed 40 characters."),

    page: z.coerce
        .number()
        .int("Page must be an integer.")
        .min(1, "Page must be at least 1.")
        .default(1),

    limit: z.coerce
        .number()
        .int("Limit must be an integer.")
        .min(1, "Limit must be at least 1.")
        .max(50, "Limit cannot exceed 50.")
        .default(10),
})
.strict();