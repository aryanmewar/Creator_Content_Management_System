import { Router } from "express";
import * as authController from "./auth.controller.js";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

// Only an existing authenticated admin/manager can create new accounts
// This prevents open registration by the public internet
router.post(
  "/register",
  protect,
  authorize("ADMIN", "CONTENT_MANAGER"),
  validate(registerSchema),
  authController.register,
);
router.get("/csrf-token", authController.getCsrfToken);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", protect, authController.getMe);
router.post("/logout", protect, authController.logout);
router.post(
  "/contributor",
  protect,
  authorize("ADMIN", "CONTENT_MANAGER"),
  authController.createContributor,
);

router.put("/profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.get(
  "/system-status",
  protect,
  authorize("ADMIN", "CONTENT_MANAGER"),
  authController.getSystemStatus,
);
router.get(
  "/export-backup",
  protect,
  authorize("ADMIN", "CONTENT_MANAGER"),
  authController.exportBackup,
);

export default router;
