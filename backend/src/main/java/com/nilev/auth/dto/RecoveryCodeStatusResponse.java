package com.nilev.auth.dto;

import java.time.Instant;

public class RecoveryCodeStatusResponse {

    private boolean hasRecoveryCode;
    private Instant createdAt;

    public RecoveryCodeStatusResponse() {
    }

    public RecoveryCodeStatusResponse(boolean hasRecoveryCode, Instant createdAt) {
        this.hasRecoveryCode = hasRecoveryCode;
        this.createdAt = createdAt;
    }

    public boolean isHasRecoveryCode() {
        return hasRecoveryCode;
    }

    public void setHasRecoveryCode(boolean hasRecoveryCode) {
        this.hasRecoveryCode = hasRecoveryCode;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

