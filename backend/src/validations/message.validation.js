import { z } from "zod";

const attachmentSchema = z
    .object({
        url: z
            .string()
            .url("Invalid attachment URL."),

        publicId: z
            .string()
            .min(1, "Attachment public ID is required."),

        fileName: z
            .string()
            .trim()
            .min(1, "Attachment file name is required."),

        mimeType: z
            .string()
            .trim()
            .min(1, "Attachment MIME type is required."),

        size: z
            .number()
            .min(0, "Attachment size cannot be negative."),
    })
    .strict();

export const sendMessageSchema = z
    .object({
        type: z
            .enum(["text", "image", "document"])
            .default("text"),

        content: z
            .string()
            .trim()
            .max(
                2000,
                "Message cannot exceed 2000 characters."
            )
            .default(""),

        attachments: z
            .array(attachmentSchema)
            .default([]),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (
            data.type === "text" &&
            !data.content
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["content"],
                message: "Message cannot be empty.",
            });
        }

        if (
            (data.type === "image" ||
                data.type === "document") &&
            data.attachments.length === 0
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["attachments"],
                message:
                    "Attachment is required for this message type.",
            });
        }
    });