import api from './api.js';
import { buildQueryString } from '../utils/formatUtils.js';

export const assignmentService = {
  getAssignments: async (params = {}) => {
    const { data } = await api.get(`/assignments${buildQueryString(params)}`);
    return data;
  },

  getAssignmentById: async (id) => {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
  },

  createAssignment: async (payload) => {
    const { data } = await api.post('/assignments', payload);
    return data;
  },

  updateAssignment: async (id, payload) => {
    const { data } = await api.put(`/assignments/${id}`, payload);
    return data;
  },
};
