import { Router } from "express";
import * as contributorController from "./contributor.controller.js";

const router = Router();

router.get("/dashboard", contributorController.getDashboard);
router.get("/assignments", contributorController.getAssignments);
router.get("/report", contributorController.getReport);

export default router;
