import api from "./api.js";
import { buildQueryString } from "../utils/formatUtils.js";

export const instructorService = {
  getInstructors: async (params = {}) => {
    const { data } = await api.get(`/instructors${buildQueryString(params)}`);
    return data;
  },

  getInstructorById: async (id) => {
    const { data } = await api.get(`/instructors/${id}`);
    return data;
  },

  createInstructor: async (formData) => {
    const { data } = await api.post("/instructors", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateInstructor: async (id, formData) => {
    const { data } = await api.put(`/instructors/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateStatus: async (id, isActive) => {
    const { data } = await api.patch(`/instructors/${id}/status`, { isActive });
    return data;
  },

  deleteInstructor: async (id) => {
    const { data } = await api.delete(`/instructors/${id}`);
    return data;
  },
};
