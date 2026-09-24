import api from "./api.js";
import { buildQueryString } from "../utils/formatUtils.js";

export const scheduleService = {
  getSchedules: async (params = {}) => {
    const { data } = await api.get(`/schedules${buildQueryString(params)}`);
    return data;
  },

  getScheduleById: async (id) => {
    const { data } = await api.get(`/schedules/${id}`);
    return data;
  },

  createSchedule: async (payload) => {
    const { data } = await api.post("/schedules", payload);
    return data;
  },

  reschedule: async (id, payload) => {
    const { data } = await api.put(`/schedules/${id}`, payload);
    return data;
  },

  cancelSchedule: async (id) => {
    const { data } = await api.delete(`/schedules/${id}`);
    return data;
  },
};
