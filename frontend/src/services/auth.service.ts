import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  AdminPasswordResetRequest,
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RecoveryCodeResponse,
  RecoveryCodeStatusResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordWithRecoveryCodeRequest,
  UserResponse,
} from "../types";
import { storageService } from "./storage.service";

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    const authData = res.data.data;
    const token = authData.accessToken || authData.token;

    if (token) {
      storageService.setToken(token, true);
      if (authData.refreshToken) {
        storageService.setRefreshToken(authData.refreshToken);
      }
      storageService.setUser(authData.user, true);
    }
    return authData;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const remember = Boolean(data.rememberMe);
    storageService.setRememberMe(remember);

    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      data
    );
    const authData = res.data.data;
    const token = authData.accessToken || authData.token;

    if (token) {
      storageService.setToken(token, remember);
      if (authData.refreshToken) {
        storageService.setRefreshToken(authData.refreshToken);
      }
      storageService.setUser(authData.user, remember);
    }
    return authData;
  },

  async refresh(): Promise<AuthResponse> {
    const refreshToken = storageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    const authData = res.data.data;
    const token = authData.accessToken || authData.token;
    const remember = storageService.getRememberMe();

    if (token) {
      storageService.setToken(token, remember);
      if (authData.refreshToken) {
        storageService.setRefreshToken(authData.refreshToken);
      }
      storageService.setUser(authData.user, remember);
    }
    return authData;
  },

  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<ApiResponse<UserResponse>>(ENDPOINTS.AUTH.ME);
    const user = res.data.data;
    if (user) {
      storageService.setUser(user, storageService.getRememberMe());
    }
    return user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      storageService.clearSession();
    }
  },

  async ping(): Promise<string> {
    const res = await apiClient.get<ApiResponse<string>>(ENDPOINTS.AUTH.PING);
    return res.data.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return res.data.message || "If an account with that email exists, password reset instructions have been sent.";
  },

  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return res.data.message || "Password has been successfully reset. You may now log in with your new password.";
  },

  async changePassword(data: ChangePasswordRequest): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return res.data.message || "Password changed successfully.";
  },

  async requestAdminPasswordReset(data: AdminPasswordResetRequest): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.ADMIN_PASSWORD_RESET_REQUEST,
      data
    );
    return res.data.message || "Password reset request submitted successfully.";
  },

  async resetPasswordWithRecoveryCode(data: ResetPasswordWithRecoveryCodeRequest): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.RESET_PASSWORD_RECOVERY_CODE,
      data
    );
    return res.data.message || "Password has been successfully reset. You may now log in with your new password.";
  },

  async generateRecoveryCode(): Promise<RecoveryCodeResponse> {
    const res = await apiClient.post<ApiResponse<RecoveryCodeResponse>>(
      ENDPOINTS.AUTH.RECOVERY_CODE_GENERATE
    );
    return res.data.data;
  },

  async getRecoveryCodeStatus(): Promise<RecoveryCodeStatusResponse> {
    const res = await apiClient.get<ApiResponse<RecoveryCodeStatusResponse>>(
      ENDPOINTS.AUTH.RECOVERY_CODE_STATUS
    );
    return res.data.data;
  },
};
