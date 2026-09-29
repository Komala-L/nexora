import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    conversationIdSchema,
} from "../validations/conversation.validation.js";

import validate, {
    validateParams,
    validateQuery,
} from "../middleware/validation.middleware.js";

import {
    createMessage,
    getMessages,
    uploadMessageAttachment,
} from "../controllers/message.controller.js";

import {
    sendMessageSchema,
} from "../validations/message.validation.js";

import {
    getConnectionsQuerySchema,
} from "../validations/connection.validation.js";

import chatUpload from "../middleware/chatUpload.middleware.js";

const router = Router();

/**
 * Upload a chat attachment.
 */
router.post("/attachments",verifyJWT,chatUpload.single("file"),uploadMessageAttachment);

/**
 * Send a message in a conversation.
 */
router.post("/:conversationId",verifyJWT,validateParams(conversationIdSchema),validate(sendMessageSchema),createMessage);

/**
 * Get messages from a conversation.
 */
router.get("/:conversationId",verifyJWT,validateParams(conversationIdSchema),validateQuery(getConnectionsQuerySchema),getMessages);

export default router;