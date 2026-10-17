import { Router } from "express";
import { 
    currentUser, 
    getUserProfile,
    getUserPresenceController,
    updateUserProfile, 
    updateUserProfileImage, 
    removeUserProfileImage, 
    updateUserLocation,
    nearbyUsers,
    discoverUsersController,
    searchUsersController
} from "../controllers/user.controller.js";

import { createUserReportController } from "../controllers/report.controller.js";

import {
    getMyModerationNotices,
    acknowledgeMyModerationNotice,
} from "../controllers/moderationNotification.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import validate, { validateQuery } from "../middleware/validation.middleware.js";

import upload, {
    reportEvidenceUpload,
} from "../middleware/upload.middleware.js";

import { 
    updateProfileSchema, 
    updateLocationSchema, 
    nearbyUsersSchema, 
    discoverUsersSchema, 
    searchUserSchema 
} from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, currentUser);
router.get("/moderation-notices",verifyJWT, getMyModerationNotices);
router.patch("/moderation-notices/:noticeId/acknowledge", verifyJWT, acknowledgeMyModerationNotice);
router.post("/:userId/report", verifyJWT, reportEvidenceUpload.array("evidence", 3), createUserReportController);
router.patch("/profile", verifyJWT, validate(updateProfileSchema), updateUserProfile);
router.patch("/profile/image", verifyJWT, upload.single("image"), updateUserProfileImage);
router.delete("/profile/image", verifyJWT, removeUserProfileImage);
router.patch("/location", verifyJWT, validate(updateLocationSchema), updateUserLocation);
router.get("/nearby", verifyJWT, validateQuery(nearbyUsersSchema), nearbyUsers);
router.get("/discover", verifyJWT, validateQuery(discoverUsersSchema), discoverUsersController);
router.get("/search", verifyJWT, validateQuery(searchUserSchema), searchUsersController);
router.get("/:userId/presence", verifyJWT, getUserPresenceController);
router.get("/:userId", verifyJWT, getUserProfile);

export default router;