import { Router } from "express";
import { changePassword, deleteAccount, getMe, login, signup } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateChangePassword, validateLogin, validateSignup } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);
router.patch("/password", protect, validateChangePassword, changePassword);
router.delete("/me", protect, deleteAccount);

export default router;
