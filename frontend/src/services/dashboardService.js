import api from "./api.js";

export const dashboardService = {
  getSummary: async () => {
    const { data } = await api.get("/dashboard/summary");
    return data;
  },

  getDeadlines: async () => {
    const { data } = await api.get("/dashboard/deadlines");
    return data;
  },

  getUpcoming: async () => {
    const { data } = await api.get("/dashboard/upcoming");
    return data;
  },

  getOverdue: async () => {
    const { data } = await api.get("/dashboard/overdue");
    return data;
  },

  getRecent: async () => {
    const { data } = await api.get("/dashboard/recent");
    return data;
  },

  getActivity: async () => {
    const { data } = await api.get("/dashboard/activity");
    return data;
  },

  getOverdueHistory: async (params = {}) => {
    const { data } = await api.get("/dashboard/overdue-history", { params });
    return data;
  },
};
