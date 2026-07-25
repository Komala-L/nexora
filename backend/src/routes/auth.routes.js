import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import validate from "../middleware/validation.middleware.js";
import { registerSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

export default router;