import axios from "axios";

// ============================================================
// SINGLE AUTHORITATIVE AXIOS CLIENT
// ============================================================

let rawBaseURL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/").trim();

if (!rawBaseURL.endsWith("/")) {
  rawBaseURL += "/";
}
if (!rawBaseURL.endsWith("/api/")) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, "") + "/api/";
}

const api = axios.create({
  baseURL: rawBaseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});



// ============================================================
// PUBLIC ENDPOINTS (never send expired Bearer to break public calls)
// ============================================================

const PUBLIC_ENDPOINTS = [
  "auth/login/",
  "auth/register/",
  "auth/google/",
  "auth/forgot-password/",
  "auth/reset-password/",
  "auth/refresh/",
];


const isPublicEndpoint = (url = "") => {
  const cleanUrl = url.replace(/^\/?(api\/)?/, "");
  return PUBLIC_ENDPOINTS.some((pub) => cleanUrl.startsWith(pub) || cleanUrl.includes(pub));
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    config.headers = config.headers || {};

    if (accessToken && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (isPublicEndpoint(config.url)) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// TOKEN REFRESH QUEUE & 401 RETRY HANDLER
// ============================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const clearLocalAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("auth_user");
  window.dispatchEvent(new Event("auth-changed"));
};

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Ignore 401 on public endpoints
    if (status === 401 && isPublicEndpoint(url)) {
      return Promise.reject(error);
    }

    // Handle 401 on protected requests
    if (status === 401 && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        clearLocalAuth();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshEndpoint = `${rawBaseURL}auth/refresh/`;
        const response = await axios.post(
          refreshEndpoint,
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const newAccess =
          response.data?.access ||
          response.data?.data?.access ||
          response.data?.data?.tokens?.access;

        if (!newAccess) {
          throw new Error("No access token in refresh response.");
        }

        localStorage.setItem("access_token", newAccess);
        processQueue(null, newAccess);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Token refresh failed:", refreshError?.message);
        processQueue(refreshError, null);
        clearLocalAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;