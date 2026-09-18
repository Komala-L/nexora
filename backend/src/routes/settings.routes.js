import express from "express";

import {
    getUserSettings,
    updateUserSettings,
} from "../controllers/settings.controller.js";

import {verifyJWT} from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
    updateSettingsSchema,
} from "../validations/settings.validation.js";

const router = express.Router();

router.use(verifyJWT);

router.get(
    "/",
    getUserSettings
);

router.patch(
    "/",
    validate(updateSettingsSchema),
    updateUserSettings
);

export default router;