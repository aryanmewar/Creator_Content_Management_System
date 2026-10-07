import SavedLink from "./SavedLink.model.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getSavedLinks = async (req, res, next) => {
  try {
    const savedLinks = await SavedLink.find({ createdBy: req.user._id }).sort(
      "-updatedAt",
    );
    return sendSuccess(res, { data: savedLinks });
  } catch (error) {
    next(error);
  }
};

export const createSavedLink = async (req, res, next) => {
  try {
    const newSavedLink = await SavedLink.create({
      title: req.body.title,
      link: req.body.link,
      assignee: req.body.assignee,
      createdBy: req.user._id,
    });
    return sendSuccess(res, { data: newSavedLink, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

export const updateSavedLink = async (req, res, next) => {
  try {
    const existing = await SavedLink.findById(req.params.id);
    if (!existing) {
      return sendError(res, {
        message: "No saved link found with that ID",
        code: "NOT_FOUND",
        statusCode: 404,
      });
    }

    if (
      existing.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return sendError(res, {
        message: "You are not authorized to modify this saved link.",
        code: "FORBIDDEN",
        statusCode: 403,
      });
    }

    const savedLink = await SavedLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    return sendSuccess(res, { data: savedLink });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedLink = async (req, res, next) => {
  try {
    const existing = await SavedLink.findById(req.params.id);
    if (!existing) {
      return sendError(res, {
        message: "No saved link found with that ID",
        code: "NOT_FOUND",
        statusCode: 404,
      });
    }

    if (
      existing.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return sendError(res, {
        message: "You are not authorized to delete this saved link.",
        code: "FORBIDDEN",
        statusCode: 403,
      });
    }

    await SavedLink.findByIdAndDelete(req.params.id);

    return sendSuccess(res, {
      message: "Deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
