import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateTask } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getTasks).post(validateTask, createTask);
router.route("/:taskId").get(getTask).patch(validateTask, updateTask).delete(deleteTask);

export default router;
