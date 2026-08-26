import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateParams, } from "../middleware/validation.middleware.js";
import { connectionUserIdSchema } from "../validations/connection.validation.js";
import {
    createConnectionRequest,
} from "../controllers/connection.controller.js";

const router = Router();

/**
 * Send a connection request.
 */
router.post("/requests/:userId",verifyJWT,validateParams(connectionUserIdSchema),createConnectionRequest);

export default router;