import api from "./api.js";
import { buildQueryString } from "../utils/formatUtils.js";

export const publicationService = {
  getPublications: async (params = {}) => {
    const { data } = await api.get(`/publications${buildQueryString(params)}`);
    return data;
  },

  createPublication: async (payload) => {
    const { data } = await api.post("/publications", payload);
    return data;
  },

  updatePublication: async (id, payload) => {
    const { data } = await api.put(`/publications/${id}`, payload);
    return data;
  },
};
