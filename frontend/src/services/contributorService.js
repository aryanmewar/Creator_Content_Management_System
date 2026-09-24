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
};
