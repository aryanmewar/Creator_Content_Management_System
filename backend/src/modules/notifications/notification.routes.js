import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import protect from "../../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.getNotifications);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/clear-all", notificationController.deleteAllNotifications);
router.delete("/:id", notificationController.deleteNotification);

export default router;
