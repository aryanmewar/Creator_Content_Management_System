import * as instructorService from "./instructor.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";
import { uploadSingle } from "../../middleware/uploadMiddleware.js";

export const getInstructors = async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const result = await instructorService.getInstructors({
      search,
      isActive,
      page,
      limit,
    });
    return sendPaginated(res, {
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getInstructorById = async (req, res, next) => {
  try {
    const instructor = await instructorService.getInstructorById(req.params.id);
    return sendSuccess(res, { data: instructor });
  } catch (error) {
    next(error);
  }
};

export const createInstructor = async (req, res, next) => {
  try {
    let imageData = null;
    if (req.uploadedFile) {
      imageData = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId,
      };
    }
    const data = { ...req.body, ...(imageData && { profileImage: imageData }) };
    const instructor = await instructorService.createInstructor(
      data,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Instructor created successfully.",
      data: instructor,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstructor = async (req, res, next) => {
  try {
    let imageData = null;
    if (req.uploadedFile) {
      imageData = {
        url: req.uploadedFile.url,
        publicId: req.uploadedFile.publicId,
      };
    }
    const data = { ...req.body, ...(imageData && { profileImage: imageData }) };
    const instructor = await instructorService.updateInstructor(
      req.params.id,
      data,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Instructor updated successfully.",
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstructorStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const instructor = await instructorService.updateInstructorStatus(
      req.params.id,
      isActive,
      req.user._id,
    );
    return sendSuccess(res, {
      message: `Instructor ${isActive ? "activated" : "deactivated"} successfully.`,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInstructor = async (req, res, next) => {
  try {
    await instructorService.deleteInstructor(req.params.id, req.user._id);
    return sendSuccess(res, {
      message: "Contributor removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
