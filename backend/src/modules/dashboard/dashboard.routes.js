import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import protect from "../../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

router.get("/summary", dashboardController.getSummary);
router.get("/deadlines", dashboardController.getDeadlines);
router.get("/upcoming", dashboardController.getUpcoming);
router.get("/overdue", dashboardController.getOverdue);
router.get("/recent", dashboardController.getRecent);
router.get("/activity", dashboardController.getActivity);
router.get("/overdue-history", dashboardController.getOverdueHistory);

export default router;
