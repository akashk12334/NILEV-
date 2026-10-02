package com.nilev.user.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequest {

    @NotBlank(message = "Confirmation keyword is required")
    private String confirmation;

    public DeleteAccountRequest() {
    }

    public DeleteAccountRequest(String confirmation) {
        this.confirmation = confirmation;
    }

    public String getConfirmation() {
        return confirmation;
    }

    public void setConfirmation(String confirmation) {
        this.confirmation = confirmation;
    }
}
