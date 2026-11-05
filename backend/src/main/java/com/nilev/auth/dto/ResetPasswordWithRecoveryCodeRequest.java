package com.nilev.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordWithRecoveryCodeRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Recovery code is required")
    private String recoveryCode;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    public ResetPasswordWithRecoveryCodeRequest() {
    }

    public ResetPasswordWithRecoveryCodeRequest(String email, String recoveryCode, String newPassword) {
        this.email = email;
        this.recoveryCode = recoveryCode;
        this.newPassword = newPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String email;
        private String recoveryCode;
        private String newPassword;

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder recoveryCode(String recoveryCode) {
            this.recoveryCode = recoveryCode;
            return this;
        }

        public Builder newPassword(String newPassword) {
            this.newPassword = newPassword;
            return this;
        }

        public ResetPasswordWithRecoveryCodeRequest build() {
            return new ResetPasswordWithRecoveryCodeRequest(email, recoveryCode, newPassword);
        }
    }
}

