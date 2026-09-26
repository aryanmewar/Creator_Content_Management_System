import { Router } from "express";
import * as contentController from "./content.controller.js";
import protect from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { uploadSingle } from "../../middleware/uploadMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";
import {
  createContentSchema,
  updateContentSchema,
  updateStatusSchema,
} from "./content.validation.js";

const router = Router();
router.use(protect);

router.get("/", contentController.getContent);
router.post(
  "/",
  ...uploadSingle("thumbnail"),
  validate(createContentSchema),
  contentController.createContent,
);
router.get("/:id", validateObjectId(), contentController.getContentById);
router.put(
  "/:id",
  validateObjectId(),
  ...uploadSingle("thumbnail"),
  validate(updateContentSchema),
  contentController.updateContent,
);
router.delete("/:id", validateObjectId(), contentController.deleteContent);
router.patch(
  "/:id/status",
  validateObjectId(),
  validate(updateStatusSchema),
  contentController.updateContentStatus,
);

export default router;
