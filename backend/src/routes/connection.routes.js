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
export default router;