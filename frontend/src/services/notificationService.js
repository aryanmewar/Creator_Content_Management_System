import api from "./api.js";

export const notificationService = {
  getNotifications: async () => {
    const { data } = await api.get("/notifications");
    return data.data; // sendSuccess structure { success: true, data: [...] }
  },
  
  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put("/notifications/read-all");
    return data;
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  deleteAllNotifications: async () => {
    const { data } = await api.delete("/notifications/clear-all");
    return data;
  },
};
