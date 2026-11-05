package com.nilev.auth.service;

import com.nilev.auth.dto.AdminPasswordResetRequest;
import com.nilev.auth.dto.AuthResponse;
import com.nilev.auth.dto.ChangePasswordRequest;
import com.nilev.auth.dto.ForgotPasswordRequest;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.RecoveryCodeResponse;
import com.nilev.auth.dto.RecoveryCodeStatusResponse;
import com.nilev.auth.dto.RegisterRequest;
import com.nilev.auth.dto.ResetPasswordRequest;
import com.nilev.auth.dto.ResetPasswordWithRecoveryCodeRequest;
import com.nilev.auth.dto.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String token);

    UserResponse getMe(Long userId);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void resetPasswordWithRecoveryCode(ResetPasswordWithRecoveryCodeRequest request);

    RecoveryCodeResponse generateRecoveryCode(Long userId);

    RecoveryCodeStatusResponse getRecoveryCodeStatus(Long userId);

    void changePassword(Long userId, ChangePasswordRequest request);

    void requestAdminPasswordReset(AdminPasswordResetRequest request);
}
