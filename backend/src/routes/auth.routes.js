import { Router } from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateLogin, validateSignup } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);

export default router;
