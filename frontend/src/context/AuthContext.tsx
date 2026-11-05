import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService, storageService } from "../services";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "../types";

export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserResponse | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserResponse | null>(() =>
    storageService.getUser()
  );
  const [token, setToken] = useState<string | null>(() =>
    storageService.getToken()
  );
  // Optimistic auth: If we already have a cached token and user profile, do not block the UI
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedToken = storageService.getToken();
    const savedUser = storageService.getUser();
    if (savedToken && savedUser) {
      return false; // Optimistically authenticated
    }
    if (!savedToken) {
      return false; // Unauthenticated, proceed directly
    }
    return true; // Token exists but profile is missing from storage
  });

  // Listen for global auth session expiry from api client
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("nilev:auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("nilev:auth:unauthorized", handleUnauthorized);
    };
  }, []);

  // Synchronize on mount and validate token with backend asynchronously
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = storageService.getToken();

      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // If we have a saved token, verify / fetch latest profile in the background
      try {
        const freshUser = await authService.getMe();
        if (isMounted) {
          // Token might have been refreshed transparently by apiClient
          const currentToken = storageService.getToken() || savedToken;
          setUser(freshUser);
          setToken(currentToken);
          storageService.setUser(freshUser, true);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // Token is strictly invalid or expired and refresh failed
          storageService.clearSession();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        } else {
          // Cold-start, network glitch, timeout, 502/503/504:
          // Keep optimistic cached session intact so the user is not abruptly logged out
          const cachedToken = storageService.getToken();
          const cachedUser = storageService.getUser();
          if (isMounted && cachedToken && cachedUser) {
            setToken(cachedToken);
            setUser(cachedUser);
          } else if (isMounted && !cachedToken) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const activeToken = response.accessToken || response.token || null;
      setToken(activeToken);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      const activeToken = response.accessToken || response.token || null;
      setToken(activeToken);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const me = await authService.getMe();
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const isAdmin = Boolean(
    user?.role &&
      (user.role.trim().toUpperCase() === "ADMIN" ||
        user.role.trim().toUpperCase() === "ROLE_ADMIN")
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
