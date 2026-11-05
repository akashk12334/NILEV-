export interface UserResponse {
  id: number;
  name: string;
  email: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
  active: boolean;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  token?: string;
  refreshToken?: string;
  tokenType: string;
  user: UserResponse;
  recoveryCode?: string;
}

export interface ResetPasswordWithRecoveryCodeRequest {
  email: string;
  recoveryCode: string;
  newPassword: string;
}

export interface RecoveryCodeResponse {
  recoveryCode: string;
}

export interface RecoveryCodeStatusResponse {
  hasRecoveryCode: boolean;
  createdAt?: string | null;
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
