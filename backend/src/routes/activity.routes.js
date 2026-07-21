import { Router } from "express";
import { clearActivity, createActivity, getActivity } from "../controllers/activity.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getActivity).post(createActivity).delete(clearActivity);

export default router;
