import { Router } from "express";
import { 
    currentUser, 
    getUserProfile, 
    updateUserProfile, 
    updateUserProfileImage, 
    removeUserProfileImage, 
    updateUserLocation,
    nearbyUsers,
    discoverUsersController
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import validate, { validateQuery } from "../middleware/validation.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { updateProfileSchema, updateLocationSchema, nearbyUsersSchema, discoverUsersSchema } from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, currentUser);
router.patch("/profile", verifyJWT, validate(updateProfileSchema), updateUserProfile);
router.patch("/profile/image", verifyJWT, upload.single("image"), updateUserProfileImage);
router.delete("/profile/image", verifyJWT, removeUserProfileImage);
router.patch("/location", verifyJWT, validate(updateLocationSchema), updateUserLocation);
router.get("/nearby", verifyJWT, validateQuery(nearbyUsersSchema), nearbyUsers);
router.get("/discover", verifyJWT, validateQuery(discoverUsersSchema), discoverUsersController);
router.get("/:userId", verifyJWT, getUserProfile);

export default router;