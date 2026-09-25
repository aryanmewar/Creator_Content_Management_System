import * as contentService from "./content.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";

export const getContent = async (req, res, next) => {
  try {
    const result = await contentService.getContent(req.query);
    return sendPaginated(res, {
      data: result.data,
      pagination: result.pagination,
      statusCounts: result.statusCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getContentById = async (req, res, next) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    return sendSuccess(res, { data: content });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req, res, next) => {
  try {
    let thumbnailData = null;
    if (req.uploadedFile) {
      thumbnailData = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId,
      };
    }
    const data = {
      ...req.body,
      ...(thumbnailData && { thumbnail: thumbnailData }),
    };
    const content = await contentService.createContent(data, req.user._id);
    return sendSuccess(res, {
      message: "Content created successfully.",
      data: content,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    let thumbnailData = null;
    if (req.uploadedFile) {
      thumbnailData = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId,
      };
    }
    const data = {
      ...req.body,
      ...(thumbnailData && { thumbnail: thumbnailData }),
    };
    const content = await contentService.updateContent(
      req.params.id,
      data,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Content updated successfully.",
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    await contentService.deleteContent(req.params.id, req.user._id);
    return sendSuccess(res, { message: "Content deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const updateContentStatus = async (req, res, next) => {
  try {
    const { status, feedback, scheduledDate, scheduledTime, publishedLinks, publishedDate } =
      req.body;
    const content = await contentService.updateContentStatus(
      req.params.id,
      status,
      req.user._id,
      feedback,
      scheduledDate,
      scheduledTime,
      publishedLinks,
      publishedDate,
    );
    return sendSuccess(res, {
      message: `Status updated to ${status}.`,
      data: content,
    });
  } catch (error) {
    next(error);
  }
};
