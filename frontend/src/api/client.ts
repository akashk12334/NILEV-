import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../constants";
import type { ApiErrorResponse, ApiResponse, AuthResponse } from "../types";
import { storageService } from "../services/storage.service";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s timeout for Render free-tier cold starts
});

// Request interceptor: Attach JWT token if available & allow browser to set FormData boundary
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If payload is FormData, remove manual Content-Type so browser generates multipart boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Automatic Token Refresh & Cold-start Retry
apiClient.interceptors.response.use(
  (response) => {
    // Notify window that server is awake and healthy
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nilev:server:ready"));
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    // 1. Handle Server Cold Start / Network Timeout / 502 / 503 / 504
    const isNetworkOrTimeout =
      error.code === "ECONNABORTED" ||
      error.message?.includes("timeout") ||
      !error.response ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.response.status === 504;

    const retryCount = originalRequest._retryCount || 0;
    if (isNetworkOrTimeout && !isAuthEndpoint && retryCount < 2) {
      originalRequest._retryCount = retryCount + 1;

      // Notify UI that server may be waking up
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nilev:server:connecting", {
            detail: { attempt: retryCount + 1 },
          })
        );
      }

      // Progressive delay: 1.5s on first retry, 3s on second retry
      const delay = (retryCount + 1) * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // 2. Handle 401 Unauthorized -> Automatic Token Refresh
    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (originalRequest._retry) {
        // Already tried refresh once and still failed: session is truly invalid
        storageService.clearSession();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nilev:auth:unauthorized"));
        }
        return Promise.reject(error);
      }

      const refreshToken = storageService.getRefreshToken();
      if (!refreshToken) {
        storageService.clearSession();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nilev:auth:unauthorized"));
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until current refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint directly using raw axios to avoid interceptor recursion
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          }
        );

        const authData = refreshResponse.data?.data;
        const newAccessToken = authData?.accessToken || authData?.token;
        const newRefreshToken = authData?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh");
        }

        // Persist fresh tokens
        storageService.setToken(newAccessToken, true);
        if (newRefreshToken) {
          storageService.setRefreshToken(newRefreshToken);
        }
        if (authData.user) {
          storageService.setUser(authData.user, true);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        storageService.clearSession();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nilev:auth:unauthorized"));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
