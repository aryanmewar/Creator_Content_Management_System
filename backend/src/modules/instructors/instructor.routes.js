import { Router } from "express";
import * as instructorController from "./instructor.controller.js";
import protect from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { uploadSingle } from "../../middleware/uploadMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";
import {
  createInstructorSchema,
  updateInstructorSchema,
  statusSchema,
} from "./instructor.validation.js";

const router = Router();

// All instructor routes require authentication
router.use(protect);

router.get("/", instructorController.getInstructors);
router.post(
  "/",
  ...uploadSingle("profileImage"),
  validate(createInstructorSchema),
  instructorController.createInstructor,
);
router.get("/:id", validateObjectId(), instructorController.getInstructorById);
router.put(
  "/:id",
  validateObjectId(),
  ...uploadSingle("profileImage"),
  validate(updateInstructorSchema),
  instructorController.updateInstructor,
);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(statusSchema),
  instructorController.updateInstructorStatus,
);
router.delete("/:id", validateObjectId(), instructorController.deleteInstructor);

export default router;
