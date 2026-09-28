import * as contributorService from "./contributor.service.js";
import { sendSuccess } from "../../utils/response.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await contributorService.getDashboard(req.user._id);
    return sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const data = await contributorService.getAssignments(req.user._id);
    return sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const data = await contributorService.getReport(req.user._id);
    return sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const markContentAsChecked = async (req, res, next) => {
  try {
    const data = await contributorService.markContentAsChecked(req.user._id, req.params.id);
    return sendSuccess(res, { data, message: "Content marked as checked" });
  } catch (error) {
    next(error);
  }
};

export const markOverdueAsAcknowledged = async (req, res, next) => {
  try {
    const data = await contributorService.markOverdueAsAcknowledged(req.user._id, req.params.id);
    return sendSuccess(res, { data, message: "Overdue status acknowledged" });
  } catch (error) {
    next(error);
  }
};
