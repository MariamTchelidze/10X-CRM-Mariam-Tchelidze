import { Router } from "express";
import { createTeamMember, getTeam } from "../controllers/team.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateTeamMember } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getTeam);
router.route("/members").post(validateTeamMember, createTeamMember);

export default router;
