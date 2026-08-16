import { Router } from "express";
import { currentUser, updateUserProfile, updateUserProfileImage, removeUserProfileImage, } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, currentUser);
router.patch("/profile", verifyJWT, validate(updateProfileSchema), updateUserProfile);
router.patch("/profile/image", verifyJWT, upload.single("image"), updateUserProfileImage);
router.delete("/profile/image", verifyJWT, removeUserProfileImage);

export default router;