import { Router } from "express";
import * as contributorController from "./contributor.controller.js";

const router = Router();

router.get("/dashboard", contributorController.getDashboard);
router.get("/assignments", contributorController.getAssignments);
router.get("/report", contributorController.getReport);
router.patch("/content/:id/check", contributorController.markContentAsChecked);
router.patch("/content/:id/acknowledge-overdue", contributorController.markOverdueAsAcknowledged);

export default router;
