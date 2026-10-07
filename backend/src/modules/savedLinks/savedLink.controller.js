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
    const savedLink = await SavedLink.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!savedLink) {
      return sendError(res, {
        message: "No saved link found with that ID",
        statusCode: 404,
      });
    }

    return sendSuccess(res, { data: savedLink });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedLink = async (req, res, next) => {
  try {
    const savedLink = await SavedLink.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!savedLink) {
      return sendError(res, {
        message: "No saved link found with that ID",
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: "Deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
