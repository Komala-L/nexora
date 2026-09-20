import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { changePasswordSchema } from "../validations/security.validation.js";
import { changeUserPassword } from "../controllers/security.controller.js";

const router = express.Router();

router.patch("/password",verifyJWT,validate(changePasswordSchema),changeUserPassword);

export default router;