import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Current password is required"),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/,
                "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            ),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your new password"),
    })
    .refine(
        (data) => data.newPassword === data.confirmPassword,
        {
            message: "New passwords do not match",
            path: ["confirmPassword"],
        }
    )
    .strict();