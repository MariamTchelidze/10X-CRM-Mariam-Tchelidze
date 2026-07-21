import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} from "../controllers/client.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateClient } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getClients).post(validateClient, createClient);
router.route("/:clientId").get(getClient).patch(validateClient, updateClient).delete(deleteClient);

export default router;
