import { Router } from "express";
import { currentUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", verifyJWT, currentUser);

export default router;