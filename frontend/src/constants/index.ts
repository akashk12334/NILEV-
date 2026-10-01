export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const STORAGE_KEYS = {
  AUTH_TOKEN: "nilev_auth_token",
  REFRESH_TOKEN: "nilev_refresh_token",
  USER_DATA: "nilev_user_data",
  REMEMBER_ME: "nilev_remember_me",
  THEME: "nilev_theme",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  HABITS: "/habits",
  GOALS: "/goals",
  PARTNER: "/partner",
  ACTIVITY: "/activity",
  COMPANION: "/companion",
  SURPRISES: "/surprises",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;
