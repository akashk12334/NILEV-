import { STORAGE_KEYS } from "../constants";
import type { UserResponse } from "../types";

export const storageService = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken(token: string, remember: boolean = true): void {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUser(): UserResponse | null {
    const raw =
      localStorage.getItem(STORAGE_KEYS.USER_DATA) ||
      sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  },

  setUser(user: UserResponse, remember: boolean = true): void {
    const serialized = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, serialized);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, serialized);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  getRememberMe(): boolean {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
  },

  setRememberMe(remember: boolean): void {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(remember));
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};
