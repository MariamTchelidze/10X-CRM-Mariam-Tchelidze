import { Router } from "express";
import {
  createNotification,
  deleteRead,
  deleteSelected,
  getNotifications,
  markAllRead,
  selectRead,
  updateNotification,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getNotifications).post(createNotification);
router.patch("/mark-all-read", markAllRead);
router.patch("/select-read", selectRead);
router.delete("/selected", deleteSelected);
router.delete("/read", deleteRead);
router.patch("/:notificationId", updateNotification);

export default router;
