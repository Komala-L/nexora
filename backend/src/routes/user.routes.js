import { Router } from "express";
import { currentUser, updateUserProfile, } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, currentUser);
router.patch("/profile", verifyJWT, validate(updateProfileSchema), updateUserProfile);

export default router;