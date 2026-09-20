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

import {
    deleteAccountController,
} from "../controllers/account.controller.js";

import {
    deleteAccountSchema,
} from "../validations/account.validation.js";

const router = express.Router();

router.use(verifyJWT);
router.get("/",getUserSettings);
router.patch("/",validate(updateSettingsSchema),updateUserSettings);
router.delete("/account",validate(deleteAccountSchema),deleteAccountController);

export default router;