import { Router } from "express";
import * as assignmentController from "./assignment.controller.js";
import protect from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from "./assignment.validation.js";

const router = Router();
router.use(protect);

router.get("/", assignmentController.getAssignments);
router.post(
  "/",
  validate(createAssignmentSchema),
  assignmentController.createAssignment,
);
router.get("/:id", validateObjectId(), assignmentController.getAssignmentById);
router.put(
  "/:id",
  validateObjectId(),
  validate(updateAssignmentSchema),
  assignmentController.updateAssignment,
);

export default router;
