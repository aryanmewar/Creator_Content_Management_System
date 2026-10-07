import express from "express";
import * as savedLinkController from "./savedLink.controller.js";
import protect from "../../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route("/")
  .get(savedLinkController.getSavedLinks)
  .post(savedLinkController.createSavedLink);

router
  .route("/:id")
  .put(savedLinkController.updateSavedLink)
  .delete(savedLinkController.deleteSavedLink);

export default router;
