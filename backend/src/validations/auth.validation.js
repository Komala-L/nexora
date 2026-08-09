import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long.")
        .max(40, "Name cannot exceed 40 characters."),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
})
.strict();

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long."),
})
.strict();