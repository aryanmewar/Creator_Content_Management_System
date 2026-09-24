import * as scheduleService from "./schedule.service.js";
import { sendSuccess, sendPaginated } from "../../utils/response.js";

export const getSchedules = async (req, res, next) => {
  try {
    const result = await scheduleService.getSchedules(req.query);
    return sendPaginated(res, {
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await scheduleService.getScheduleById(req.params.id);
    return sendSuccess(res, { data: schedule });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleService.createSchedule(
      req.body,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Content scheduled successfully.",
      data: schedule,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleService.rescheduleContent(
      req.params.id,
      req.body,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Content rescheduled successfully.",
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    await scheduleService.cancelSchedule(req.params.id, req.user._id);
    return sendSuccess(res, { message: "Schedule cancelled." });
  } catch (error) {
    next(error);
  }
};
