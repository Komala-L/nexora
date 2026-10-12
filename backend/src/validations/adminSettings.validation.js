import { z } from "zod";

export const updateAdminSettingsSchema = z.object({
    platformName: z.string()
        .trim()
        .min(1, "Platform name is required.")
        .max(60)
        .optional(),

    tagline: z.string()
        .trim()
        .max(120)
        .optional(),

    supportEmail: z.union([
        z.literal(""),
        z.string().trim().email().max(254),
    ]).optional(),

    maintenanceMode: z.boolean().optional(),

    allowRegistration: z.boolean().optional(),
}).strict().refine(
    (body) => Object.keys(body).length > 0,
    { message: "Provide at least one setting to update." }
);