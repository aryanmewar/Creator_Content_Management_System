import * as assignmentService from "./assignment.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";

export const getAssignments = async (req, res, next) => {
  try {
    const result = await assignmentService.getAssignments(req.query);
    return sendPaginated(res, {
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    return sendSuccess(res, { data: assignment });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(
      req.body,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Content assigned successfully.",
      data: assignment,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(
      req.params.id,
      req.body,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Assignment updated successfully.",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};
