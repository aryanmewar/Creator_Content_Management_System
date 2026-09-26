import axios from "axios";
import { API_BASE_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  // Required for HttpOnly cookies to be sent/received cross-origin
  withCredentials: true,
});

// ── Response Interceptor — handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookie is gone or expired — redirect to login only if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
