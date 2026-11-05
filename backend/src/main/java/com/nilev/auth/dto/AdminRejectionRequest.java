package com.nilev.auth.dto;

import jakarta.validation.constraints.Size;

public class AdminRejectionRequest {

    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String reason;

    public AdminRejectionRequest() {
    }

    public AdminRejectionRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

