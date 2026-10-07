import { Router } from "express";
import * as contributorController from "./contributor.controller.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = Router();

router.get("/dashboard", contributorController.getDashboard);
router.get("/assignments", contributorController.getAssignments);
router.get("/report", contributorController.getReport);
router.patch("/content/:id/check", validateObjectId(), contributorController.markContentAsChecked);
router.patch("/content/:id/acknowledge-overdue", validateObjectId(), contributorController.markOverdueAsAcknowledged);

export default router;
