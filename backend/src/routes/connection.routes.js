import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateParams, } from "../middleware/validation.middleware.js";
import { 
    connectionUserIdSchema, 
    connectionIdSchema, 
} from "../validations/connection.validation.js";
import {
    createConnectionRequest,
    acceptConnection,
    rejectConnection,
    cancelConnection,
} from "../controllers/connection.controller.js";

const router = Router();

/**
 * Send a connection request.
 */
router.post("/requests/:userId",verifyJWT,validateParams(connectionUserIdSchema),createConnectionRequest);

/**
 * Accept a pending connection request.
 */
router.patch("/requests/:connectionId/accept",verifyJWT,validateParams(connectionIdSchema),acceptConnection);

/**
 * Reject a pending connection request.
 */
router.patch("/requests/:connectionId/reject",verifyJWT,validateParams(connectionIdSchema),rejectConnection);

/**
 * Cancel an outgoing pending connection request.
 */
router.delete("/requests/:connectionId",verifyJWT,validateParams(connectionIdSchema),cancelConnection);
export default router;