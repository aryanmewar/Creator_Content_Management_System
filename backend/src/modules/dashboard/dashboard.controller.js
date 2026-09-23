import * as dashboardService from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

export const getDeadlines = async (req, res, next) => {
  try {
    const data = await dashboardService.getDeadlines();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const data = await dashboardService.getUpcoming();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

export const getOverdue = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverdue();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

export const getRecent = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecent();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

export const getActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getActivity();
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};
