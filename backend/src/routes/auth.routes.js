import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import validate from "../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;