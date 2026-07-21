import { Router } from "express";
import {
  clearAllMessages,
  clearConversation,
  createMessage,
  getMessages,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getMessages).post(createMessage).delete(clearAllMessages);
router.delete("/:conversation", clearConversation);

export default router;
