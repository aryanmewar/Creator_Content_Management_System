import axios from "axios";
import { API_BASE_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  // Required for HttpOnly cookies to be sent/received
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Read cookie value by name in browser
 */
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

let csrfPromise = null;

/**
 * Fetch a fresh CSRF token from the backend
 */
export const fetchCsrfToken = async () => {
  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${API_BASE_URL}/auth/csrf-token`, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.csrfToken;
        return token || getCookie("XSRF-TOKEN");
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
        return null;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
};

// ── Request Interceptor — attach JWT & CSRF tokens ────────────────────────────
api.interceptors.request.use(async (config) => {
  // Attach JWT Bearer Token if present
  const token = localStorage.getItem("cms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach CSRF Token for state-changing HTTP methods
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    let csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken && !config.url?.includes("/auth/csrf-token")) {
      csrfToken = await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }

  return config;
});

// ── Response Interceptor — handle CSRF rotation and 401 globally ──────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errCode = error.response?.data?.code;

    // Transparently refresh CSRF token and retry once if token expired/mismatched
    if (
      status === 403 &&
      (errCode === "CSRF_TOKEN_INVALID" ||
        errCode === "CSRF_TOKEN_MISMATCH" ||
        errCode === "CSRF_TOKEN_MISSING") &&
      !error.config._retry
    ) {
      error.config._retry = true;
      const freshToken = await fetchCsrfToken();
      if (freshToken) {
        error.config.headers["X-CSRF-Token"] = freshToken;
        error.config.headers["X-XSRF-TOKEN"] = freshToken;
        return api(error.config);
      }
    }

    if (status === 401) {
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
