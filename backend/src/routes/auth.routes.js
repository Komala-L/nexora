import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../controllers/auth.controller.js";
import validate from "../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);

export default router;