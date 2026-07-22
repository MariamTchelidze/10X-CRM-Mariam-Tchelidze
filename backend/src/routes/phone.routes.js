import { Router } from "express";
import { startPhoneCall } from "../controllers/phone.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/call", startPhoneCall);

export default router;
