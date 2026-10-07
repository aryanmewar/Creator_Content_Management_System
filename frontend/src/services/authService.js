import api from "./api.js";

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout: async () => {
    // Server clears the HttpOnly cookie; nothing to clear client-side
    await api.post("/auth/logout");
  },

  createContributor: async (data) => {
    const res = await api.post("/auth/contributor", data);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put("/auth/profile", profileData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await api.put("/auth/change-password", passwordData);
    return res.data;
  },

  getSystemStatus: async () => {
    const res = await api.get("/auth/system-status");
    return res.data;
  },

  exportBackup: async () => {
    const res = await api.get("/auth/export-backup");
    return res.data;
  },

  getCsrfToken: async () => {
    const { data } = await api.get("/auth/csrf-token");
    return data;
  },
};
