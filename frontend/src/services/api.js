import axios from "axios";
import { API_BASE_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  // Required for HttpOnly cookies to be sent/received cross-origin
  withCredentials: true,
});

// ── Request Interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ── Response Interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthMe = error.config?.url?.includes("/auth/me");
      if (window.location.pathname !== "/login" && !isAuthMe) {
        localStorage.removeItem("cms_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
