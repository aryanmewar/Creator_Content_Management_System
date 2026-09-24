import { Router } from "express";
import * as contentController from "./content.controller.js";
import protect from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { uploadSingle } from "../../middleware/uploadMiddleware.js";
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
router.get("/:id", contentController.getContentById);
router.put(
  "/:id",
  ...uploadSingle("thumbnail"),
  validate(updateContentSchema),
  contentController.updateContent,
);
router.delete("/:id", contentController.deleteContent);
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  contentController.updateContentStatus,
);

export default router;
