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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize on mount and validate token with backend if present
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = storageService.getToken();
      const savedUser = storageService.getUser();

      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // If we have a saved token, verify / fetch latest profile
      try {
        const freshUser = await authService.getMe();
        if (isMounted) {
          setUser(freshUser);
          setToken(savedToken);
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          // Attempt refresh token exchange if available
          const refreshToken = storageService.getRefreshToken();
          if (refreshToken) {
            try {
              const refreshed = await authService.refresh();
              if (isMounted) {
                setToken(refreshed.accessToken || refreshed.token || null);
                setUser(refreshed.user);
              }
              return;
            } catch {
              // Refresh failed, clean up
              storageService.clearSession();
              if (isMounted) {
                setToken(null);
                setUser(null);
              }
            }
          } else {
            storageService.clearSession();
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        } else {
          // If offline/network error, keep the saved user from storage
          if (isMounted && savedUser) {
            setUser(savedUser);
            setToken(savedToken);
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

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
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
