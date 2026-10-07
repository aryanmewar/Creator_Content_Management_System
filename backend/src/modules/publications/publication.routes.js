import { Router } from "express";
import * as publicationController from "./publication.controller.js";
import protect from "../../middleware/authMiddleware.js";
import { z } from "zod";
import validate from "../../middleware/validateMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";
import { PLATFORMS } from "../../utils/statusUtils.js";

const safeUrl = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (val) => /^https?:\/\//i.test(val),
    "URL must start with http:// or https://",
  );

const createPublicationSchema = z.object({
  contentId: z.string().min(1, "Content is required"),
  platform: z.enum(PLATFORMS),
  publishedAt: z.coerce.date({ required_error: "Published date is required" }),
  postUrl: safeUrl,
  notes: z.string().max(500).optional().nullable(),
});

const updatePublicationSchema = z.object({
  postUrl: safeUrl.optional(),
  publishedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional().nullable(),
});

const router = Router();
router.use(protect);

router.get("/", publicationController.getPublications);
router.post(
  "/",
  validate(createPublicationSchema),
  publicationController.createPublication,
);
router.get("/:id", validateObjectId(), publicationController.getPublicationById);
router.put(
  "/:id",
  validateObjectId(),
  validate(updatePublicationSchema),
  publicationController.updatePublication,
);

export default router;
