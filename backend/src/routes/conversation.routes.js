import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    validateParams,
    validateQuery,
} from "../middleware/validation.middleware.js";

import {
    createConversationController,
    getMyConversations,
    getConversation,
} from "../controllers/conversation.controller.js";

import {
    getConnectionsQuerySchema,
} from "../validations/connection.validation.js";

import {
    conversationUserIdSchema,
    conversationIdSchema,
} from "../validations/conversation.validation.js";

const router = Router();

/**
 * Create a conversation with an accepted connection.
 */
router.post("/:userId",verifyJWT,validateParams(conversationUserIdSchema),createConversationController);

/**
 * Get the authenticated user's conversations.
 */
router.get("/",verifyJWT,validateQuery(getConnectionsQuerySchema),getMyConversations);

/**
 * Get a specific conversation.
 */
router.get("/:conversationId",verifyJWT,validateParams(conversationIdSchema),getConversation);

export default router;