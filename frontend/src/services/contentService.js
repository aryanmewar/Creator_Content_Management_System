import api from './api.js';
import { buildQueryString } from '../utils/formatUtils.js';

export const contentService = {
  getContent: async (params = {}) => {
    const { data } = await api.get(`/content${buildQueryString(params)}`);
    return data;
  },

  getContentById: async (id) => {
    const { data } = await api.get(`/content/${id}`);
    return data;
  },

  createContent: async (payload) => {
    const { data } = await api.post('/content', payload);
    return data;
  },

  updateContent: async (id, payload) => {
    const { data } = await api.put(`/content/${id}`, payload);
    return data;
  },

  deleteContent: async (id) => {
    const { data } = await api.delete(`/content/${id}`);
    return data;
  },

  updateContentStatus: async (id, status, feedback = null, extraData = {}) => {
    const { data } = await api.patch(`/content/${id}/status`, { status, feedback, ...extraData });
    return data;
  },
};
