import { z } from "zod";

export const updateSettingsSchema = z.object({
    discoveryPreferences: z
        .array(
            z.enum(["friends", "professional", "learning"])
        )
        .min(1, "At least one discovery preference is required")
        .max(3, "Maximum of 3 discovery preferences are allowed")
        .optional(),

    isDiscoverable: z
        .boolean()
        .optional(),
}).strict();