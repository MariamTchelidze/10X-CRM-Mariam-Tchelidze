import { Router } from "express";
import { getPhoneSettings, updatePhoneSettings } from "../controllers/setting.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/phone").get(getPhoneSettings).patch(updatePhoneSettings);

export default router;
