import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import protect from "../../middleware/authMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.getNotifications);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", validateObjectId(), notificationController.markAsRead);
router.delete("/clear-all", notificationController.deleteAllNotifications);
router.delete("/:id", validateObjectId(), notificationController.deleteNotification);

export default router;
