import express from "express";
import { z } from "zod";
import * as savedLinkController from "./savedLink.controller.js";
import protect from "../../middleware/authMiddleware.js";
import validate from "../../middleware/validateMiddleware.js";
import { validateObjectId } from "../../middleware/validateObjectId.js";

const safeUrl = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (val) => /^https?:\/\//i.test(val),
    "URL must start with http:// or https://",
  );

const createSavedLinkSchema = z.object({
  title: z.string().min(1, "Please provide a title").max(200),
  link: safeUrl,
  assignee: z.string().max(100).optional().nullable(),
});

const updateSavedLinkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  link: safeUrl.optional(),
  assignee: z.string().max(100).optional().nullable(),
});

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route("/")
  .get(savedLinkController.getSavedLinks)
  .post(validate(createSavedLinkSchema), savedLinkController.createSavedLink);

router
  .route("/:id")
  .put(
    validateObjectId(),
    validate(updateSavedLinkSchema),
    savedLinkController.updateSavedLink,
  )
  .delete(validateObjectId(), savedLinkController.deleteSavedLink);

export default router;
