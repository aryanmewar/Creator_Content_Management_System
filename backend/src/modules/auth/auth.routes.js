import { Router } from "express";
import * as authController from "./auth.controller.js";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/roleMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", protect, authController.getMe);
router.post("/logout", protect, authController.logout);
router.post(
  "/contributor",
  protect,
  authorize("ADMIN", "CONTENT_MANAGER"),
  authController.createContributor,
);

export default router;
