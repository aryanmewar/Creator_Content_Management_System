import api from "./api.js";

export const contributorService = {
  getDashboard: async () => {
    const { data } = await api.get("/contributor/dashboard");
    return data.data;
  },

  getAssignments: async () => {
    const { data } = await api.get("/contributor/assignments");
    return data.data;
  },

  getReport: async () => {
    const { data } = await api.get("/contributor/report");
    return data.data;
  },

  markAsChecked: async (id) => {
    const { data } = await api.patch(`/contributor/content/${id}/check`);
    return data.data;
  },

  markOverdueAsAcknowledged: async (id) => {
    const { data } = await api.patch(`/contributor/content/${id}/acknowledge-overdue`);
    return data.data;
  },
};
