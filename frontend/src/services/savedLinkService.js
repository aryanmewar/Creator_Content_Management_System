import api from "./api.js";

const savedLinkService = {
  getSavedLinks: async () => {
    const response = await api.get("/saved-links");
    return response.data.data;
  },

  createSavedLink: async (data) => {
    const response = await api.post("/saved-links", data);
    return response.data.data;
  },

  updateSavedLink: async (id, data) => {
    const response = await api.put(`/saved-links/${id}`, data);
    return response.data.data;
  },

  deleteSavedLink: async (id) => {
    await api.delete(`/saved-links/${id}`);
  },
};

export default savedLinkService;
