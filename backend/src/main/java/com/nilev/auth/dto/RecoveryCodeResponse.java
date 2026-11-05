package com.nilev.auth.dto;

public class RecoveryCodeResponse {

    private String recoveryCode;

    public RecoveryCodeResponse() {
    }

    public RecoveryCodeResponse(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }
}

