package com.nilev.auth.controller;

import com.nilev.auth.dto.*;
import com.nilev.auth.service.AuthService;
import com.nilev.common.ApiResponse;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth", "/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("Account registered successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Refresh-Token", required = false) String customHeader) {

        String token = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            token = request.getRefreshToken();
        } else if (customHeader != null && !customHeader.isBlank()) {
            token = customHeader;
        } else if (authHeader != null && !authHeader.isBlank()) {
            token = authHeader;
        }

        AuthResponse response = authService.refresh(token);
        return ResponseEntity.ok(ApiResponse.success("Session refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("If an account with that email exists, password reset instructions have been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been successfully reset. You may now log in with your new password."));
    }

    @PostMapping("/reset-password/admin-request")
    public ResponseEntity<ApiResponse<Void>> requestAdminPasswordReset(
            @Valid @RequestBody AdminPasswordResetRequest request) {
        authService.requestAdminPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset request submitted successfully. An administrator will verify and assist with your account recovery."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully."));
    }

    @PostMapping("/reset-password/recovery-code")
    public ResponseEntity<ApiResponse<Void>> resetPasswordWithRecoveryCode(
            @Valid @RequestBody ResetPasswordWithRecoveryCodeRequest request) {
        authService.resetPasswordWithRecoveryCode(request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been successfully reset. You may now log in with your new password."));
    }

    @PostMapping("/recovery-code/generate")
    public ResponseEntity<ApiResponse<RecoveryCodeResponse>> generateRecoveryCode(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RecoveryCodeResponse response = authService.generateRecoveryCode(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Recovery code generated successfully. Save this code in a secure location.", response));
    }

    @GetMapping("/recovery-code/status")
    public ResponseEntity<ApiResponse<RecoveryCodeStatusResponse>> getRecoveryCodeStatus(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RecoveryCodeStatusResponse response = authService.getRecoveryCodeStatus(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = authService.getMe(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> ping() {
        return ResponseEntity.ok(ApiResponse.success("NILEV Auth Service is active"));
    }
}
