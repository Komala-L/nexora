import { z } from "zod";

import { objectIdSchema } from "./common.validation.js";

export const conversationUserIdSchema = z.object({
    userId: objectIdSchema,
}).strict();

export const conversationIdSchema = z.object({
    conversationId: objectIdSchema,
}).strict();